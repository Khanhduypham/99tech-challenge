import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ResourceType } from "../enum/resource-type.enum";

export class CreateResourceRequestDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(ResourceType)
  type: ResourceType;
}
