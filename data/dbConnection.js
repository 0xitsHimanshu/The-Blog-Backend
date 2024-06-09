import mongoose from "mongoose";

const dbConnection = async () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("***Connectiones to Database is successful***")) 
    .catch((err) => console.error(err));
};

export default dbConnection;