import { IsEnum, IsOptional, IsString } from "class-validator";
import { ResourceType } from "../enum/resource-type.enum";
import { PaginationRequestDto } from "../../../common/pagination";

export class GetAllResourcesRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @IsOptional()
  @IsString()
  name?: string;
}
