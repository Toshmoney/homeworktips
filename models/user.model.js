const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 10 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
    },
    password: {
      type: String,
      minlength: 6
    },
    profilePicture: {
      type: String
    },
    profileCover: {
        type: String
      },
    isVerified: {
      type: Boolean,
      default: false
    },
    userType: {
      type: String,
      required: true,
      enum: ["writer", "admin", "moderator"],
      default:"writer"
    },
    profileDescription: {
      type: String
    },
    
    accountStatus: {
      type: String,
      required: true,
      enum: ["active", "suspended", "banned"],
      default: "active"
    },
    availability: {
      type: Boolean,
      default: true
    },

    walletAddress:{
        type:String
    },
    subscription:{
      type:String,
      required:true,
      enum:["premium", "basic"],
      default:"basic"
    },
    resetToken: String,
    resetExpires: Date,
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
