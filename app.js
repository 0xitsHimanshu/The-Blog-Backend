import express from "express";
import userRouter from "./routes/userRouter.js";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

//initialize express
export const app = express();


//using middlewares
app.use(express.json());
app.use(cors())

//routes
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
