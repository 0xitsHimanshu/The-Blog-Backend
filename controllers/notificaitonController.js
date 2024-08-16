import { Notification } from "../Schema/Notification.js";


export const newNotification = (req, res) => {
    let user_id = req.user.id;

    Notification.exists({notification_for: user_id, seen: false,user: {$ne: user_id}})
    .then((result) => {
        if(result){
            res.status(200).json({new_notification_available: true})
        }else{
            res.status(200).json({new_notification_available: false})
        }
    })
    .catch( err => {
        console.log(err, "error")
        res.status(500).json({message: err.message})
    })
}