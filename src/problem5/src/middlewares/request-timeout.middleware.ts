import { Request, Response, NextFunction } from "express";

const requestTimeout = (ms: number) => {
  return (_: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ message: "Request timed out" });
      }
    }, ms);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    next();
  };
};

export default requestTimeout;
