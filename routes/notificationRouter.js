import express from 'express';

const route = express.Router();

route.get("/test-notification", (req, res) => {
    res.send("Notification Route is working fine")
});

export default route;