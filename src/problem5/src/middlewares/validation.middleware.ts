import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { TypedRequest } from "../common/types";

export enum ValidationSource {
  BODY = "body",
  QUERY = "query",
  PARAMS = "params",
}

type ValidationSourceType =
  | ValidationSource.BODY
  | ValidationSource.QUERY
  | ValidationSource.PARAMS;

export const validationMiddleware = <T extends object>(
  type: new () => T,
  source: ValidationSourceType = ValidationSource.BODY
) => {
  return async (req: TypedRequest<T>, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(type, req[source]);
    const errors = await validate(dtoObj, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    if (source === ValidationSource.BODY) req.customBody = dtoObj;
    if (source === ValidationSource.QUERY) req.customQuery = dtoObj;
    if (source === ValidationSource.PARAMS) req.customParams = dtoObj;

    next();
  };
};
