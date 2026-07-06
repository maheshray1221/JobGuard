import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDB } from "./db/mydb.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const port = Number(process.env.PORT) || 7000;
    const server = app.listen(port, () => {
      console.log(`JobGuard API listening on port ${port}`);
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received. Shutting down gracefully.`);
      server.close(() => {
        void mongoose.disconnect().finally(() => process.exit(0));
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start JobGuard API", error);
    process.exit(1);
  }
};

void startServer();
