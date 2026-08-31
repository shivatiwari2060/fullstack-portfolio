import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Project } from './project.entity';

class CreateProjectDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsOptional() @IsArray() techStack?: string[];
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

class UpdateProjectDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() techStack?: string[];
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Controller('projects')
export class ProjectsController {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.repo.save(this.repo.create(dto));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const result = await this.repo.update(id, dto);
    if (!result.affected) throw new NotFoundException();
    return this.repo.findOneBy({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException();
    return { deleted: true };
  }
}
