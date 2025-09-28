import { ResourceType } from "../enum/resource-type.enum";

export class ResourceResponseDTO {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
}
