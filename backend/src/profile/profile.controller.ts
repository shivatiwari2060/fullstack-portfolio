import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsOptional, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Profile } from './profile.entity';

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() about?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() twitterUrl?: string;
  @IsOptional() @IsString() resumeUrl?: string;
}

@Controller('profile')
export class ProfileController {
  constructor(
    @InjectRepository(Profile) private readonly repo: Repository<Profile>,
  ) {}

  @Get()
  async get() {
    const profile = await this.repo.find({ take: 1 });
    if (!profile.length) throw new NotFoundException('Profile not set up yet');
    return profile[0];
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Body() dto: UpdateProfileDto) {
    const existing = await this.repo.find({ take: 1 });
    if (existing.length) {
      await this.repo.update(existing[0].id, dto);
      return this.repo.findOneBy({ id: existing[0].id });
    }
    return this.repo.save(this.repo.create(dto as Partial<Profile>));
  }
}
