import { ERROR_TYPE } from "../middlewares/error-handler.middleware";

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = ERROR_TYPE.NOT_FOUND;
  }
}
