import mongoose from "mongoose"

export const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`connect to db host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("error while connection db ", error)
        process.exit(1)
    }
}