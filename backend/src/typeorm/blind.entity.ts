import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export enum folderType {
  FOLDER,
  MUSIC
}

@Entity()
export class BlindEntry {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'blind_id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  title: string;

  @ManyToOne(() => User, (user) => user.blindEntries, {onDelete: 'CASCADE'})
  user: User

  @OneToMany(() => Node, (entry) => entry.blind)
  entries: Node[]
  
}

@Entity()
@Unique(['name', 'blind'])
export class Node {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'blind_entry_id',
  })
  id: number;

  @Column({
      nullable: false,
      default: '',
  })
  name: string;

  @Column({
      nullable: true,
      default: '',
  })
  url: string;

  @ManyToOne(()=>BlindEntry, (blind)=> blind.entries, {onDelete: 'CASCADE'})
  blind: BlindEntry

  @OneToMany(() => Node, (entry) => entry.parent)
  childrens: Node[]

  @ManyToOne(()=>Node, (entry)=> entry.childrens, {onDelete: 'CASCADE'})
  parent: Node | undefined

  @Column({
      nullable: false,
      default: 0,
  })
  prof: number
  
  @Column({
      nullable: false,
      default: folderType.FOLDER,
  })
  type: folderType;

  @Column({
      nullable: false,
      default: '',
  })
  videoId: string;

}