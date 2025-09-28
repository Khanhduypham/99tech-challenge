import { Request } from "express";

export interface TypedQueryRequest<T> extends Request {
  customQuery: T;
}

export interface TypedBodyRequest<T> extends Request {
  customBody: T;
}

export interface TypedRequest<T> extends Request {
  customQuery: T;
  customBody: T;
  customParams: T;
}