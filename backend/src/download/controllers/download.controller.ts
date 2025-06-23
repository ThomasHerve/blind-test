// src/download/download.controller.ts
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as archiver from 'archiver';
import * as ytdl from 'ytdl-core';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('youtube')
export class DownloadController {
  constructor(
    @InjectRepository(BlindEntry) private readonly blindEntriesRepo: Repository<BlindEntry>,
    @InjectRepository(BlindNode) private readonly nodeRepo: Repository<BlindNode>,
  ) {}

  @Get(':id/download')
  async downloadZip(@Param('id') id: string, @Res() res: Response) {
    const blindId = parseInt(id, 10);
    const blind = await this.blindEntriesRepo.findOne({
      where: { id: blindId },
      relations: ['entries'],
    });
    if (!blind) {
      throw new NotFoundException(`Blind test ${id} introuvable`);
    }

    // Prépare l’archive ZIP
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="blind-${id}.zip"`,
    });
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => res.status(500).send({ error: err.message }));
    archive.pipe(res);

    // Fonction récursive pour parcourir l’arbre
    const buildTree = async (node: any, currentPath = '') => {
      // crée le dossier courant (vide), archiver gère ça automatiquement quand on ajoute un fichier
      const folderPath = currentPath + node.name + '/';
      if (node.type) {
        // c’est une vidéo
        const videoId = node.videoId;
        const filename = `${folderPath}${node.name.replace(/[\/\\]/g, '_')}.mp4`;
        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
        // on ajoute le flux de ytdl dans l’archive
        archive.append(
          ytdl(ytUrl, { filter: 'audioandvideo' }),
          { name: filename }
        );
      }
      // traite les enfants
      if (node.childrens && node.childrens.length > 0) {
        for (const child of node.childrens) {
          // charge l’instance complète pour récupérer childrens, videoId, etc.
          const inst = await this.nodeRepo.findOne({
            where: { id: child.id },
            relations: ['childrens'],
          });
          if (inst) {
            await buildTree(inst, folderPath);
          }
        }
      }
    };

    // on démarre depuis chaque racine
    for (const entry of blind.entries.filter((instance)=>instance && instance.parent == null)) {
      const root = await this.nodeRepo.findOne({
        where: { id: entry.id },
        relations: ['childrens'],
      });
      if (root) {
        await buildTree(root, '');
      }
    }

    // finalise l’archive
    await archive.finalize();
  }
}
