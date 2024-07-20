import { Schema, model } from "mongoose";

const userSchema = Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: [true, "Please add the user email"],
      unique: [true, "Email is already taken"],
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    token: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
