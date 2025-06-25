import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';

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

  @ManyToMany(() => User, (user) => user.sharedBlindEntries)
  @JoinTable()
  collaborators: User[]

  @OneToMany(() => BlindNode, (entry) => entry.blind)
  entries: BlindNode[]
  
}

@Entity()
export class BlindNode {
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

  @OneToMany(() => BlindNode, (entry) => entry.parent)
  childrens: BlindNode[]

  @ManyToOne(()=>BlindNode, (entry)=> entry.childrens, {onDelete: 'CASCADE'})
  parent: BlindNode | undefined

  @Column({
      nullable: false,
      default: 0,
  })
  prof: number
  
  @Column({
      nullable: false,
      default: false,
  })
  type: boolean; // true: music

  @Column({
      nullable: false,
      default: '',
  })
  videoId: string;

  @Column({
    nullable: false,
    default: 0
  })
  position: number;

}