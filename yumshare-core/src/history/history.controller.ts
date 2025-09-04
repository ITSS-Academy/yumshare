import { Controller, Post, Get, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Controller('history')
@UseGuards(RateLimitGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  create(@Body() createDto: CreateHistoryDto) {
    return this.historyService.create(createDto);
  }

  @Get()
  @RateLimit(RateLimits.STANDARD)
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateHistoryDto) {
    return this.historyService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }
} 