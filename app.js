import express from 'express';
import userRouter from './routes/userRouter.js';
import dotenv from 'dotenv';

dotenv.config();

//initialize express
export const app = express();

//using middlewares
app.use(express.json());

//routes
app.use("/api/users", userRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
