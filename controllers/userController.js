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

    let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth password");

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

export const getProfile = (req, res) => {
  let {username } = req.body;

  User.findOne({"personal_info.username": username})
   .select("-personal_info.password -google_auth -updatedAt -blogs")
   .then( user => {
      return res.status(200).json(user);
   })
   .catch(err => {
      return res.status(500).json({"error": err.message})
   })

}


export const changeProfileImg = (req, res) => {
  const {url} = req.body;
  
  User.findOneAndUpdate({ _id: req.user.id }, { "personal_info.profile_img": url })
   .then(()=> {
      return res.status(200).json({profile_img: url});
   })
   .catch (err => {
      return res.status(500).json({error: err.message});
   })

}

export const editProfile = (req, res) => {
  let {username, bio, social_links} = req.body;
  const bioLimit = 150;

  if(username.length < 3) {
    return res.status(403).json({error: "Username should be atleast 3 characters long"});
  }
  if(bio.length > bioLimit) {
    return res.status(403).json({error: `Bio should be less than ${bioLimit} characters long`});
  }

  let socialLinksArr = Object.keys(social_links);

  try {

    for(let i=0; i<socialLinksArr.length; i++){
      if(social_links[socialLinksArr[i]].length){
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== "website") {
          return res.status(500).json({error: `${socialLinksArr[i]} link is invalid. You must enter a full URL`});
        }
      }
    }
    
  } catch (error) {
    return res.status(500).json({error: "You must provide a valid URL for the social links with http(s) included"});
  }

  let UpdateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
     social_links
  }

  User.findOneAndUpdate({_id: req.user.id}, UpdateObj, {
    runValidators: true
  }).then(()=> {
    return res.status(200).json({username});
  })
  .catch(err => {
    if(err.code === 11000) {
      return res.status(403).json({error: "Username is already taken"});
    }
    return res.status(500).json({error: err.message});
  })

}

export const changePassword = (req, res) => {
  
  let { currentPassword, newPassword } = req.body;

  // Check if the passwords meet the required criteria
  if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
    return res.status(403).json({
      error: "Password should be at least 6 characters long and should contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
    });
  }

  if(currentPassword === newPassword) {
    return res.status(403).json({error: "New password cannot be the same as the current password"});
  }

  // Find the user by their ID
  User.findOne({ _id: req.user.id })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user is using Google authentication
      if (user.google_auth) {
        return res.status(403).json({ error: "Cannot change password. Please use Google authentication." });
      }

      // Compare the current password with the stored password
      bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Something went wrong. Please try again." });
        }
        if (!result) {
          return res.status(403).json({ error: "Invalid current password" });
        }

        // Hash the new password
        bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ error: "Error hashing the new password." });
          }

          // Update the user's password in the database
          User.findOneAndUpdate({ _id: req.user.id }, { "personal_info.password": hashedPassword }, { new: true })
            .then(() => {
              return res.status(200).json({ message: "Password changed successfully" });
            })
            .catch((err) => {
              return res.status(500).json({ error: err.message });
            });
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};