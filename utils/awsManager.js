import aws from "aws-sdk";
import { nanoid } from "nanoid";

// export const s3 = new aws.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });

// export const generateURL = async () =>{
//     const date = new Date();
//     const  imageName = `${nanoid()}-${date.getTime()}.jpeg`;

//     return await s3.getSignedUrlPromise({
//         Bucket: "theblogbucket",
//         Key: imageName,
//         ContentType: "image/jpeg",
//         Expires: 1000,
//     })
// }

export const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const generateURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    const params = {
        Bucket: "theblogbucket",
        Key: imageName,
        ContentType: "image/jpeg",
        Expires: 1000, // Ensure this is a number, not a string
    };

    // Add debugging statements
    console.log('Params:', params);

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        return url;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};
