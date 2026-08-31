import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Message } from './message.entity';

class CreateMessageDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @IsString() @MaxLength(5000) body: string;
}

@Controller('messages')
export class MessagesController {
  constructor(
    @InjectRepository(Message) private readonly repo: Repository<Message>,
  ) {}

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    await this.repo.save(this.repo.create(dto));
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    const result = await this.repo.update(id, { read: true });
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
