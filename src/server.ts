import { json } from "body-parser";
import { NextFunction, Request, Response } from "express";
import express from "express";
import "reflect-metadata";

import database from "./config/database";
import AppError from "./utils/appError";
import authRouter from "./routes/auth.route";

const cors = require("cors");
require("dotenv").config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const app = express();

database
  .initialize()
  .then(async () => {
    console.log("database connection created");
  })
  .catch((error: Error) => {
    console.error({ error });
    console.info(`Database connection failed with error ${error}`);
  });

app.use(json());
app.use(cors(corsOptions));

app.use("/api/auth", authRouter);

app.get("/", async (_, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "message",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

app.use((error: AppError, req: Request, res: Response, next: NextFunction) => {
  error.status = error.status || "error";
  error.statusCode = error.statusCode || 500;

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`server running on PORT ${process.env.PORT || 4000}`);
});
