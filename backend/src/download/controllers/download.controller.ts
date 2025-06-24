// src/download/download.controller.ts
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as archiver from 'archiver';
//import * as ytdl from 'ytdl-core';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from 'src/users/services/users/public.decorator';
import  *  as ytdlp from 'yt-dlp-wrap';

@Controller('youtube')
export class DownloadController {

  private dl = new ytdlp.default()

  constructor(
    @InjectRepository(BlindEntry) private readonly blindEntriesRepo: Repository<BlindEntry>,
    @InjectRepository(BlindNode) private readonly nodeRepo: Repository<BlindNode>,
  ) {}

  @Public()
  @Get(':id/download')
  async download(@Param('id') id: string) {
        const blindId = parseInt(id, 10);
    const blind = await this.blindEntriesRepo.findOne({
      where: { id: blindId },
      relations: ['entries'],
    });
    if (!blind) throw new NotFoundException();

    const buildTree = async (node: BlindNode) => {
      const fullNode = await this.nodeRepo.findOne({
        where: { id: node.id },
        relations: ['childrens'],
      });
      if (!fullNode) return null;

      return {
        id: fullNode.id,
        name: fullNode.name,
        videoId: fullNode.videoId,
        type: fullNode.type,
        link: fullNode.url,
        childrens: await Promise.all((fullNode.childrens || []).map(buildTree)),
      };
    };

    const entriesWithInstance = await Promise.all(
      blind.entries.map(async (e) => {
        const instance = await this.nodeRepo.findOne({
          where: { id: e.id },
          relations: ['parent'],
        });
        return { entry: e, instance };
      })
    );

    const roots = entriesWithInstance
      .filter(({ instance }) => instance?.parent == null)
      .map(({ entry }) => entry);
    const tree = await Promise.all(roots.map(buildTree));

    return { id: blind.id, name: blind.title, tree };
  }
}
