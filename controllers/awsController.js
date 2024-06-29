import { generateURL } from "../utils/awsManager.js";

export const getUploadURL = async (req, res) => {
    generateURL()
     .then((url)=> {
        return res.status(200). json({"uploadUrl": url});
     })
     .catch((err)=> {
        console.log(err.message);
        return res.status(500).json({error: "Internal Server Error"});
     })
};