import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'recipes' })
export class Recipe {
  @PrimaryGeneratedColumn()
 
  id: number;
  @Column({ unique: true })
  title: string;
  @Column()
  country: string;
  @Column()
  description: string;
  
  @Column({ array: true })
  ingredients: string;
  @Column()
  instructions: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
