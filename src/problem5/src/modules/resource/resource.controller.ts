import { Router } from "express";
import { ResourceService } from "./resource.service";
import { CreateResourceRequestDTO } from "./dto/create-resource.request.dto";
import {
  validationMiddleware as validate,
  ValidationSource,
} from "../../middlewares/validation.middleware";
import { GetAllResourcesRequestDto } from "./dto/get-all-resources.request.dto";
import { TypedBodyRequest, TypedQueryRequest } from "../../common/types";
import { UpdateResourceRequestDTO } from "./dto/update-resource.request.dto";

const resourceRouter = Router();
const resourceService = new ResourceService();

resourceRouter.post(
  "/",
  validate(CreateResourceRequestDTO),
  async (req: TypedBodyRequest<CreateResourceRequestDTO>, res, _next) => {
    const body = req.customBody;
    const result = await resourceService.create(body);
    res.json(result);
  }
);

resourceRouter.get(
  "/",
  validate(GetAllResourcesRequestDto, ValidationSource.QUERY),
  async (req: TypedQueryRequest<GetAllResourcesRequestDto>, res, _next) => {
    const query = req.customQuery;
    const result = await resourceService.findAll(query);
    res.json(result);
  }
);

resourceRouter.get("/:id", async (req, res, _next) => {
  const id = req.params.id;
  const result = await resourceService.findOne(id);
  res.json(result);
});

resourceRouter.put(
  "/",
  validate(UpdateResourceRequestDTO),
  async (req: TypedBodyRequest<UpdateResourceRequestDTO>, res, _next) => {
    const body = req.customBody;
    const result = await resourceService.update(body);
    res.json(result);
  }
);

resourceRouter.delete("/:id", async (req, res, _next) => {
  const id = req.params.id;
  await resourceService.delete(id);
  res.json();
});

export default resourceRouter;
