import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { Blog } from '../blogs/blog.entity';
import { Experience } from '../experiences/experience.entity';
import { Profile } from '../profile/profile.entity';
import { Project } from '../projects/project.entity';
import { Skill } from '../skills/skill.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Experience, Project, Skill, Blog]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
