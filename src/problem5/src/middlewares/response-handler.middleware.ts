import { Request, Response, NextFunction } from "express";

const responseHandler = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  const oldJson = res.json.bind(res);

  res.json = (data: any) => {
    if (res.statusCode >= 400) {
      return oldJson(data);
    }

    return oldJson({
      success: true,
      message: "Success",
      data,
    });
  };

  next();
};

export default responseHandler;