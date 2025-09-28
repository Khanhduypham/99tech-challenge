import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ResourceType } from "../enum/resource-type.enum";

export class UpdateResourceRequestDTO {
  @IsNotEmpty()
  @IsUUID()
  id!: string;
  
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;
}
