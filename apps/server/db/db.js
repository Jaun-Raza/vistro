import mongoose from "mongoose";
import 'dotenv/config';

export async function connectDB() {
    await mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log('DB Connected Successfully!')
    }).catch(err => {
        console.log('DB Error', err)
    })
}
