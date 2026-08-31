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
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Blog } from './blog.entity';

class CreateBlogDto {
  @IsString() title: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() excerpt: string;
  @IsString() content: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
}

class UpdateBlogDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

@Controller('blogs')
export class BlogsController {
  constructor(
    @InjectRepository(Blog) private readonly repo: Repository<Blog>,
  ) {}

  @Get()
  findPublished() {
    return this.repo.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        createdAt: true,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const blog = await this.repo.findOne({ where: { slug, published: true } });
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.repo.findOneBy({ id });
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogDto) {
    const slug = dto.slug?.trim() || slugify(dto.title);
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
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
