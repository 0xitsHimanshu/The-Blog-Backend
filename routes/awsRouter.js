import express from 'express';
import { getUploadURL } from '../controllers/awsController.js';


const route = express.Router();

route.get("/get-upload-url", getUploadURL);

export default route;