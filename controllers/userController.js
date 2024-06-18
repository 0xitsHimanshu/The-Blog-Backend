import { User } from "../Schema/User.js";
import bcrypt from "bcrypt";
import { generateUsername } from "../utils/helper.js";
import { sendCookie } from "../utils/sendCookie.js";
import { getAuth } from "firebase-admin/auth";

// regex for email and password
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password


export const test = async (req, res) => {
  try {
    res.send("Test route is working");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

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
    let {accessToken} = req.body;

    getAuth()
     .verifyIdToken(accessToken)
     .then(async (decodedUser) => {

        let {email, name, picture} = decodedUser;
        
        picture = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({"personal_info.email": email}).select("persnal_info.fullname personal_info.username personal_info.profile_img google_auth")
        .then((u)=>{
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({error: err.message});
        });

        if(user){
          if(!user.google_auth){
            return res.status(403).json({error: "User with this email already exists. Please signin using email and password"});
          }
        } else {
          user = await User.create({
            personal_info: {
              fullname: name,
              email,
              username: await generateUsername(email),
            },
            google_auth: true
          });
        }

        return res.status(200).json(sendCookie(user));
     })

  } catch (err) {
    console.log(err);
  }
};