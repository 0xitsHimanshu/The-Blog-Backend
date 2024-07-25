import { User } from "../Schema/User.js";
import bcrypt from "bcrypt";
import { generateUsername } from "../utils/helper.js";
import { sendCookie } from "../utils/sendCookie.js";
import { getAuth } from "firebase-admin/auth";

// regex for email and password
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// #function to signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (name.length < 3)
      return res
        .status(403)
        .json({ error: "Name should be atleast 3 characters long" });
    if (!emailRegex.test(email))
      return res.status(403).json({ error: "Invalid email" });
    if (!passwordRegex.test(password))
      return res.status(403).json({
        error:
          "Password should be atleast 6 characters long and should contain atleast 1 uppercase letter, 1 lowercase letter and 1 number",
      });

    let user = await User.findOne({ "personal_info.email": email });
    if (user)
      return res
        .status(403)
        .json({ error: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    let userName = await generateUsername(email);

    user = await User.create({
      personal_info: {
        fullname: name,
        email,
        password: hashedPassword,
        username: userName,
      },
    });
    return res.status(200).json(sendCookie(user)); //sending cookies and formatting the data at the same time 

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// #function to signin
export const signin = async (req, res) => {
    try{
        const { email, password} = req.body;

        const user = await User.findOne({"personal_info.email": email});

        if(!user) return res.status(403).json({error: "Invalid email"});

        // if (!user.password) {
        //   return res.status(400).json({ error: "User does not have a password. Please use Google authentication." });
        // }

        const isMatch = await bcrypt.compare(password, user.personal_info.password);
        if(!isMatch) return res.status(404).json({error: "Invalid password"})

        return res.status(200).json(sendCookie(user));

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// #function to googleAuth

export const googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const decodedUser = await getAuth().verifyIdToken(accessToken);
    const { email, name, picture } = decodedUser;

    const user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth password");

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({ error: "User with this email already exists. Please signin using email and password" });
      }
    } else {
      const updatedPicture = picture.replace("s96-c", "s384-c");
      const username = await generateUsername(email);
      
      user = await User.create({
        personal_info: {
          fullname: name,
          email,
          username,
          profile_img: updatedPicture,
        },
        google_auth: true
      });
    }

    return res.status(200).json(sendCookie(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// #function to search users

export const searchUsers = async (req, res) => {
  let {query} = req.body;

  User.find({ "personal_info.username": new RegExp(query,'i')})
   .limit(50)
   .select("personal_info.username personal_info.fullname personal_info.profile_img -_id")
   .then( users => {
      return res.status(200).json({users})
   })
   .catch(err => {
      return res.status(500).json({"error": err.message})
   })
  
};