import mongoose from 'mongoose';

const dbConnection = async () => {
   mongoose.connect(process.env.DB_URL)
   .then(() => {
        console.log('***Database connected successfully***');
   }).catch((err) => {
        console.error(err);
   });
}

export default dbConnection;