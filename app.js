import express from "express";
import userRouter from "./routes/userRouter.js";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./the-blog-react-js-firebase-adminsdk-o33j8-9996435ee8.json";

dotenv.config();

//initialize express
export const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
})


//using middlewares
app.use(express.json());
app.use(cors())

//routes
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
