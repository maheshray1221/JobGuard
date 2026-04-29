import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { app } from "./app.js";
import { connectDB } from "./db/mydb.js";

connectDB()
  .then(() => {
    const port: number = Number(process.env.PORT) || 7000;
    app.listen(port, () => {
      console.log(`continue working on port ${port}`);
    });
  })
  .catch((err: Error) => {
    console.log("Error while listen time", err);
  });
