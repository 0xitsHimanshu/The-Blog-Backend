import jwt from 'jsonwebtoken';

export const sendCookie = (user) => {
    const accessToken = jwt.sign({id:user._id}, process.env.JWT_SECRET);
    
    return {
        accessToken,
        user: {
            profile_img: user.personal_info.profile_img,
            username: user.personal_info.username,
            fullname: user.personal_info.fullname,
        }
    }
}