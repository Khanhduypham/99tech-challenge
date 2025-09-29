import express from "express";
import cors from "cors";
import router from "./src/routers";
import requestTimeout from "./src/middlewares/request-timeout.middleware";
import responseHandler from "./src/middlewares/response-handler.middleware";
import errorHandler from "./src/middlewares/error-handler.middleware";
import AppDataSource from "./src/config/database.config";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestTimeout(10000));
app.use(responseHandler);

app.use("/api", router);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
