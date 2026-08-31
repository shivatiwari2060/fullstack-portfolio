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
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Skill } from './skill.entity';

class CreateSkillDto {
  @IsString() name: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) level?: number;
  @IsOptional() @IsInt() sortOrder?: number;
}

class UpdateSkillDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) level?: number;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Controller('skills')
export class SkillsController {
  constructor(
    @InjectRepository(Skill) private readonly repo: Repository<Skill>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({ order: { category: 'ASC', sortOrder: 'ASC' } });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSkillDto) {
    return this.repo.save(this.repo.create(dto));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
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
