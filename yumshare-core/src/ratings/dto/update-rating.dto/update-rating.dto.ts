import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from '../create-rating.dto/create-rating.dto';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  // This will automatically include rating?: number and comment?: string
}