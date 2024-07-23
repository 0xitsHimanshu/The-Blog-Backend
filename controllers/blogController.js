import { nanoid } from "nanoid";
import { Blog } from "../Schema/Blog.js";
import { User } from "../Schema/User.js";

export const createBlog = async (req, res) => {

   let authorID = req.user.id;
   let { title, banner, content, tags, des, draft } = req.body;

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

    let blog_id = title.replace(/[^a-zA-Z0-9]/g," ").replace(/\s+/g, "-").trim() + nanoid();

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
};

export const getLatestBlog = (req,res) => {
    const maxLimit = 5

    Blog.find({draft: false})
     .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
     .sort({"publishedAt": -1})
     .select("blog_id title des banner activity tags publishedAt -_id")
     .limit(maxLimit)
     .then( blogs => {
        return res.status(200).json({blogs})
     })
     .catch(err => {
        return res.status(500).json({"error": err.message})
     })
}

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