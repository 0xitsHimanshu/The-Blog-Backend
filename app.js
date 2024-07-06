import express from "express";
import userRouter from "./routes/userRouter.js";
import awsRouter from "./routes/awsRouter.js"
import blogRouter from "./routes/blogRouter.js"
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./the-blog-react-js-firebase-adminsdk-o33j8-9996435ee8.json" assert { type: "json" };

dotenv.config();

//initialize express
export const app = express();

//using middlewares
app.use(express.json());
app.use(cors())


admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
})

//routes
app.use("/api/users", userRouter);
app.use("/api/aws", awsRouter);
app.use("/api/blog", blogRouter)

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
