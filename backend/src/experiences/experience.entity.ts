import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company: string;

  @Column()
  role: string;

  @Column('text')
  description: string;

  @Column('simple-array', { default: '' })
  techStack: string[];

  @Column()
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ default: false })
  current: boolean;

  @Column({ default: 0 })
  sortOrder: number;
}
