import { Request, Response, NextFunction } from "express";

export enum ERROR_TYPE {
  NOT_FOUND = "NOT FOUND",
}
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);

  if (err.name === ERROR_TYPE.NOT_FOUND) {
    res.status(404).json({
      success: false,
      message: err.message || "Not found",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
