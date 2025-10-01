import { Exclude, Expose } from "class-transformer";
import { ResourceType } from "../enum/resource-type.enum";

@Exclude()
export class ResourceResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  type: ResourceType;
}
