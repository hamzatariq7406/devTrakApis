import { connect as _connect } from "mongoose";
const connectDb = async () => {
  try {
    const connect = await _connect(process.env.MONGODB_DATABASE_URL);
    console.log("Database connected: " + connect.connection.name);
    console.log("-------------------------------------------------")
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDb;
