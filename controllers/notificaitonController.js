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

export const get_notifications = (req, res) => {
    let user_id = req.user.id;
    let {page, filter, deletedDocCount} = req.body;

    let maxLimit = 10;
    
    let findQuery = {notification_for: user_id, user: {$ne: user_id}}
    let skipDocs = (page-1) * maxLimit;
    
    if(filter != 'all'){
        findQuery.type = filter;
    }
    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id banner")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({createdAt: -1})
    .select("createdAt type seen reply")
    .then((notifications) => {

        Notification.updateMany(findQuery, {seen: true})
         .skip(skipDocs)
         .limit(maxLimit)
         .then(() => {
            // Here's the logic for marking the notifications 
         })

        res.status(200).json({notifications})
    })
    .catch(err => {
        console.log(err, "error")
        res.status(500).json({message: err.message})
    })
}

export const all_notifications_count = (req, res) => {
    let user_id = req.user.id;
    let {filter} = req.body;
    let findQuery = {notification_for: user_id, user: {$ne: user_id}}

    if(filter != 'all'){
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(totalDocs => {
        return res.status(200).json({totalDocs})
    })
    .catch(err => {
        return res.status(500).json({message: err.message})
    })
}