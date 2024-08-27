import express from "express";
import userRouter from "./routes/userRouter.js";
import blogRouter from "./routes/blogRouter.js";
import notificationRouter from "./routes/notificationRouter.js"
import awsRouter from "./routes/awsRouter.js"
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";

dotenv.config();

const serviceAccount = {
  "type": process.env.GOOGLE_TYPE, 
  "project_id":process.env.GOOGLE_PROJECT_ID,
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email":process.env.GOOGLE_CLIENT_EMAIL,
  "client_id":process.env.GOOGLE_CLIENT_ID,
  "auth_uri":process.env.GOOGLE_AUTH_URI,
  "token_uri": process.env.GOOGLE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.GOOGLE_UNIVERSE_DOMAIN,
};

//initialize express
export const app = express();

//using middlewares
app.use(express.json());
app.use(cors())


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})


//routes
app.use("/api/users", userRouter);
app.use("/api/blog", blogRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/aws", awsRouter); 


app.get("/", (req, res) => {
  res.send("Hello, World!");
});
