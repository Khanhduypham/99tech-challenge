import { Router } from "express";
import resourceRouter from "./modules/resource/resource.controller";

const router = Router();

router.use("/resource", resourceRouter);

export default router;