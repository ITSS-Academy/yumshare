import { PartialType } from "@nestjs/mapped-types";
import { CreateRecipeDto } from "../create-recipe.dto/create-recipe.dto";

export class UpdateRecipeDto extends  PartialType(CreateRecipeDto) {}