import express from 'express';
import { newNotification } from '../controllers/notificaitonController.js';
import { verifyJWT } from '../utils/helper.js';

const route = express.Router();

route.get("/new-notification",verifyJWT ,newNotification);

export default route;