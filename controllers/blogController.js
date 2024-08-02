import { nanoid } from "nanoid";
import { Blog } from "../Schema/Blog.js";
import { User } from "../Schema/User.js";
import { Notification } from "../Schema/Notification.js";


export const createBlog = async (req, res) => {

   let authorID = req.user.id;
   let { title, banner, content, tags, des, draft, id } = req.body;

   if(!title.length)
        return res.status(403).json({"error": "You must provide a title"})

   if(!draft){
       if(!des.length || des.length > 200)
           return res.status(403).json({"error": "You must provide a description of the blog within 200 characters"})
       if(!banner.length)
           return res.status(403).json({"error": "You must provide a blog banner to publish it"});
       if(!content.blocks.length)
           return res.status(403).json({"error": "There must be some blog content to publish it"});
       if(!tags.length || tags.length > 10)
           return res.status(403).json({"error": "Provide tags in order to publish the blog, Maximum 10"});
   }

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id ||  title.replace(/[^a-zA-Z0-9]/g," ").replace(/\s+/g, "-").trim() + nanoid();

    if(id){
        Blog.findOneAndUpdate({blog_id}, {title, des, banner, content, tags, draft:draft ? draft: false})
         .then(()=> {
            return res.status(200).json({id: blog_id})
         }).catch(err => {
            return res.status(500).json({error: err.message})
         })
        
    } else {
        let blog = new Blog({
            title, des, banner, content, tags, author: authorID, blog_id, draft: Boolean(draft)
        })
    
        try {
            // Save the blog
            await blog.save();
            
            let incrementVal = draft ? 0 : 1;
    
            // Update the user's total posts and add the blog to the user's blogs array
            await User.findOneAndUpdate(
                { _id: authorID },
                { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } }
            );
    
            return res.status(200).json({ id: blog.blog_id });
        } catch (err) {
            return res.status(500).json({ "error": err.message });e
        }
    }
};

export const getLatestBlog = (req,res) => {
    const maxLimit = 5
    let {page} = req.body;

    Blog.find({draft: false})
     .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
     .sort({"publishedAt": -1})
     .select("blog_id title des banner activity tags publishedAt -_id")
     .skip((page - 1) * maxLimit)
     .limit(maxLimit)
     .then( blogs => {
        return res.status(200).json({blogs})
     })
     .catch(err => {
        return res.status(500).json({"error": err.message})
     })
}

export const getAllLatestBlogCount = (req, res) => {
    Blog.countDocuments({draft: false})
     .then(count => {
        return res.status(200).json({ totalDocs: count })
     })
     .catch(err => {
        console.log(err.message)
        return res.status(500).json({"error": err.message})
     })
};

export const getTrendingBlog = (req,res) => {
    const maxLimit = 5;
    Blog.find({draft: false})
     .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
     .sort({"activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1})
     .select("blog_id title publishedAt -_id")
     .limit(maxLimit)
     .then( blogs => {
        return res.status(200).json({blogs})
     })
     .catch(err => {
        return res.status(500).json({"error": err.message})
     })
};

export const searchBlogs = (req, res) => {
    let {tag,query,author,page, limit, eleminate_blog} = req.body;
    let findQuery;

    if(tag){
        findQuery = {tags: tag, draft: false,  blog_id: { $ne : eleminate_blog}};
    } else if( query){
        findQuery = {draft: false, title: new RegExp(query,'i')};
    } else if(author){
        findQuery = {draft: false,author}; 
    }

    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt": -1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then( blogs => {
       return res.status(200).json({blogs})
    })
    .catch(err => {
       return res.status(500).json({"error": err.message})
    })
};

export const searchBlogsCount = (req, res) => {
    let {tag, query, author} = req.body;

    let findQuery;

    if(tag){
        findQuery = {tags: tag, draft: false};
    } else if( query){
        findQuery = {draft: false, title: new RegExp(query,'i')};
    } else if(author){
        findQuery = {draft: false,author}; 
    }

    Blog.countDocuments(findQuery)
     .then(count => {
        return res.status(200).json({ totalDocs: count })
     })
     .catch(err => {
        console.log(err.message)
        return res.status(500).json({"error": err.message})
     })
}

export const getBlog = (req, res) => {
    let {blog_id, draft, mode} = req.body;
    let increamentVal = mode != 'edit' ? 1 : 0;


    Blog.findOneAndUpdate({blog_id}, { $inc : {"activity.total_reads": increamentVal}})
     .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
     .select("title des banner content tags activity publishedAt blog_id")
     .then(blog => {

        User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username}, { $inc: {"activity.total_reads": increamentVal}})
        .catch(err => {
            console.log(err.message)
            return res.status(500).json({"error": err.message})
        })

        if(blog.draft && !draft) {
            return res.status(500).json({error: 'You cannot access draft blogs.'})
        }

        return  res.status(200).json({blog});
     })
     .catch(err => {
        return res.status(500).json({"error": err.message})
     });
};

export const likeBlog = (req, res) => {
    let user_id = req.user.id;
    let { _id, islikedByUser } = req.body;
    let incrementVal = !islikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal }})
        .then((blog) => {
            if (!islikedByUser) {
                let like = new Notification({
                    type: "like",
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                });

                like.save()
                    .then((notification) => {
                        return res.status(200).json({ liked_by_user: true });
                    })
            } else {
                Notification.findOneAndDelete({user: user_id, type: "like", blog: _id})
                 .then( data => {
                     return res.status(200).json({ liked_by_user: false });
                 })
                 .catch( err => {
                    return res.status(500).json({error: err.message})
                 })
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: "Error updating blog", details: err.message });
        });
};

export const islikedByUser = (req, res) => { 
    let user_id = req.user.id;
    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
        .then((result) => {
            return res.status(200).json({ result});
        })
        .catch((err) => {
            return res.status(500).json({  error: err.message });
        });
}