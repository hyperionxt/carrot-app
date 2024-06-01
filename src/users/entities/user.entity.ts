import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';

export enum Role {
  ADMIN = 'ADMIN',
  REGULAR = 'REGULAR',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;
  @Column()
  name: string;

  @Column({ nullable: true })
  lastname?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => Recipe, { cascade: true })
  @JoinTable()
  favorites: Recipe[];
  @Column()
  role: Role;
  @Column({ default: false })
  confirmed: boolean;
  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}
