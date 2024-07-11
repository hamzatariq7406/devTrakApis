const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: [true, "Please add the user phone number"],
      unique: [true, "Phone number is already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    promoCode: {
      type: String
    },
    role: {
      type: String,
      required: [true, "Please add the user role"],
      anum: ["admin", "user"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
