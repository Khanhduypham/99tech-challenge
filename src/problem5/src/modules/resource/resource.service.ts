import { plainToInstance } from "class-transformer";
import AppDataSource from "../../config/database.config";
import { Resource } from "../../entities/resource.entity";
import { CreateResourceRequestDTO } from "./dto/create-resource.request.dto";
import { ResourceResponseDTO } from "./dto/resource.response.dto";
import { GetAllResourcesRequestDto } from "./dto/get-all-resources.request.dto";
import { Like } from "typeorm";
import { PaginationResponseDto } from "../../common/pagination";
import { UpdateResourceRequestDTO } from "./dto/update-resource.request.dto";
import { NotFoundError } from "../../common/error";

export class ResourceService {
  private repo = AppDataSource.getRepository(Resource);

  async create(data: CreateResourceRequestDTO): Promise<ResourceResponseDTO> {
    const resource = this.repo.create(data);
    return plainToInstance(ResourceResponseDTO, await this.repo.save(resource));
  }

  async findAll(
    query: GetAllResourcesRequestDto
  ): Promise<PaginationResponseDto<ResourceResponseDTO>> {
    const { type, name, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (type) where.type = type;
    if (name) where.name = Like(`%${name}%`);

    const [resources, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return plainToInstance(PaginationResponseDto<ResourceResponseDTO>, {
      data: resources,
      total,
      currentPage: page,
    });
  }

  async findOne(id: string): Promise<ResourceResponseDTO> {
    const resouce = await this.repo.findOneBy({ id, isDeleted: false });
    if (!resouce) {
      throw new NotFoundError("Resource does not exist!");
    }

    return plainToInstance(ResourceResponseDTO, resouce);
  }

  async update(data: UpdateResourceRequestDTO): Promise<ResourceResponseDTO> {
    const resource = await this.repo.findOneBy({ id: data.id, isDeleted: false });

    if (!resource) {
      throw new NotFoundError("Resource does not exist!");
    }

    const updatedData = {
      ...resource,
      name: data.name || resource.name,
      description: data.description || resource.description,
      type: data.type || resource.type,
    };

    return await this.repo.save(updatedData);
  }

  async delete(id: string) {
    const resource = await this.repo.findOneBy({ id, isDeleted: false });

    if (!resource) {
      throw new NotFoundError("Resource does not exist!");
    }

    return await this.repo.update(resource, { isDeleted: true });
  }
}
