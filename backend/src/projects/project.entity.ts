import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { default: '' })
  techStack: string[];

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  liveUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  sortOrder: number;
}
