import { Controller, Post, Get, Param, Delete, Body, Put, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto/update-rating.dto';

@Controller('ratings')
@UseGuards(RateLimitGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto);
  }

  @Get()
  @RateLimit(RateLimits.STANDARD)
  findAll() {
    return this.ratingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(id, updateRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ratingsService.remove(id);
  }
}
