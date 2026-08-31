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
import { Experience } from './experience.entity';

class CreateExperienceDto {
  @IsString() company: string;
  @IsString() role: string;
  @IsString() description: string;
  @IsOptional() @IsArray() techStack?: string[];
  @IsString() startDate: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() current?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

class UpdateExperienceDto {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() techStack?: string[];
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() current?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Controller('experiences')
export class ExperiencesController {
  constructor(
    @InjectRepository(Experience)
    private readonly repo: Repository<Experience>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateExperienceDto) {
    return this.repo.save(this.repo.create(dto));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
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
