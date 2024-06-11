import { User } from "../Schema/User.js";
import { nanoid } from "nanoid";
import { sendCookie } from "./sendCookie.js";

// function to generate username
export const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameExists = await User.exists({
    "personal_info.username": username,
  }).then((res) => res);

  isUsernameExists ? (username += nanoid().substring(0, 5)) : "";

  return username;
};
