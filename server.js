import express from 'express';
import dotenv from 'dotenv';
import dbConnection from './data/dbConnection.js';

const app = express();

//middlewares 
dotenv.config();

dbConnection();

const port = process.env.PORT ||  3000;


//routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});