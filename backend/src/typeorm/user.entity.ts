import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlindEntry } from './blind.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  username: string;

  @Column({
    name: 'email_address',
    nullable: false,
    default: '',
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  @Column({
    nullable: false,
    default: false,
  })
  admin: boolean;

  @OneToMany(() => BlindEntry, (blind) => blind.user)
  blindEntries: BlindEntry[]

  @ManyToMany(() => BlindEntry, (blind) => blind.collaborators)
  sharedBlindEntries: BlindEntry[]
}
