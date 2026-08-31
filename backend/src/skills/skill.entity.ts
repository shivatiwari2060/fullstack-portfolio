import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'other' })
  category: string;

  @Column({ default: 80 })
  level: number;

  @Column({ default: 0 })
  sortOrder: number;
}
