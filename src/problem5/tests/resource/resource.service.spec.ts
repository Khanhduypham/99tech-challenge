import { Repository } from "typeorm";
import AppDataSource from "../../src/config/database.config";
import { Resource } from "../../src/entities/resource.entity";
import { ResourceService } from "../../src/modules/resource/resource.service";
import { ResourceType } from "../../src/modules/resource/enum/resource-type.enum";

describe("ResourceService", () => {
  let service: ResourceService;
  let repo: Repository<Resource>;
  let fakeResources: Resource[];

  beforeAll(() => {
    repo = AppDataSource.getRepository(Resource);
    service = new ResourceService();
  });

  beforeEach(async () => {
    fakeResources = [
      repo.create({ name: "Audio 1", type: ResourceType.AUDIO }),
      repo.create({
        name: "Document 1",
        type: ResourceType.DOCUMENT,
        isDeleted: true,
      }),
      repo.create({
        name: "Document 2",
        type: ResourceType.DOCUMENT,
        description: "TEST ABC",
      }),
      repo.create({ name: "Link 1", type: ResourceType.LINK }),
    ];

    await repo.save(fakeResources);
  });

  describe("Get all resources", () => {
    it("should return paginated resources", async () => {
      const result = await service.findAll({ page: 1, limit: 2 });

      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        name: "Audio 1",
        type: ResourceType.AUDIO,
      });
      expect(result.data[1]).toMatchObject({
        name: "Document 2",
        type: ResourceType.DOCUMENT,
        description: "TEST ABC",
      });
    });

    it("should filter by type", async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        type: ResourceType.LINK,
      });

      expect(result.data.every((r) => r.type === ResourceType.LINK)).toBe(true);
    });

    it("should filter by name", async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        name: "Doc",
      });

      expect(result.data.every((r) => r.name.includes("Doc"))).toBe(true);
    });
  });

  describe("Get resource by id", () => {
    it("should return success", async () => {
      const result = await service.findOne(fakeResources[0].id);

      expect(result).toMatchObject({
        id: fakeResources[0].id,
        name: fakeResources[0].name,
        type: fakeResources[0].type,
        description: fakeResources[0].description,
      });
    });

    it("should throw an exception", async () => {
      const findFunc = service.findOne("123");

      await expect(findFunc).rejects.toThrow("Resource does not exist!");
    });
  });

  describe("Create new resource", () => {
    it("should create a new resource", async () => {
      const dto = { name: "New Doc", type: ResourceType.DOCUMENT };
      const result = await service.create(dto);

      expect(result).toMatchObject({
        name: "New Doc",
        type: ResourceType.DOCUMENT,
      });

      const saved = await repo.findOneBy({ id: result.id });
      expect(saved).toBeTruthy();
    });
  });

  describe("Update resource", () => {
    it("should update a resource successfully", async () => {
      const dto = {
        id: fakeResources[0].id,
        name: "Updated Audio",
        description: "Updated desc",
      };
      const result = await service.update(dto);

      expect(result).toMatchObject({
        id: fakeResources[0].id,
        name: "Updated Audio",
        description: "Updated desc",
      });

      const updated = await repo.findOneBy({ id: dto.id });
      expect(updated?.name).toBe("Updated Audio");
    });

    it("should throw NotFoundError if updating non-existent resource", async () => {
      const dto = { id: "does-not-exist", name: "Test" };
      await expect(service.update(dto)).rejects.toThrow(
        "Resource does not exist!"
      );
    });
  });

  describe("Delete resource", () => {
    it("should soft delete a resource", async () => {
      const id = fakeResources[0].id;

      await service.delete(id);

      const deleted = await repo.findOneBy({
        id,
        isDeleted: false,
      });

      expect(deleted).toBeNull();
    });

    it("should throw NotFoundError if deleting non-existent resource", async () => {
      await expect(service.delete("fake-id")).rejects.toThrow(
        "Resource does not exist!"
      );
    });
  });
});
