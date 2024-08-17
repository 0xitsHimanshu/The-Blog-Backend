import express from 'express';
import { all_notifications_count, get_notifications, newNotification } from '../controllers/notificaitonController.js';
import { verifyJWT } from '../utils/helper.js';

const route = express.Router();

route.get("/new-notification",verifyJWT ,newNotification);
route.post("/notifications", verifyJWT, get_notifications);
route.post("/all-notifications-count", verifyJWT, all_notifications_count);

export default route;