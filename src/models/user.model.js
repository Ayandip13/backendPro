import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  //`pre` hook is also a middleware which helps to execute the perticular function just before save the data(like encrypt the password before save into database), when each middleware calls next.
  if (!this.isModified("password")) return next(); //calling the next() means pass the flag forward.

  this.password = await bcrypt.hash(this.password, 10); //`bcrypt` is a library which help us to hash(encrypt) our passwords.
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  //This is how methods (functions) are added to the Mongoose schema. It allows us to define custom methods that can be called on instances of the User model.
  return await bcrypt.compare(password, this.password); // `this.password` refers to the hashed password stored in the database for this user document
};




userSchema.methods.generateAccessToken = async function () {
  // This method generates a new access token for the user

  // `jwt.sign` creates a signed token with the user information as the payload
  // - The payload includes the user's _id, email, username, and fullName
  // - The token is signed with the secret stored in `process.env.ACCESS_TOKEN_SECRET`
  // - The token will expire after the duration specified in `process.env.ACCESS_TOKEN_EXPIRY`
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Example: '1h' (1 hour)
    }
  );
};





userSchema.methods.generateRefreshToken = async function () {
  // This method generates a new refresh token for the user

  // `jwt.sign` creates a signed token with only the user's _id as the payload
  // - The refresh token is signed with the secret stored in `process.env.REFRESH_TOKEN_SECRET`
  // - The token will expire after the duration specified in `process.env.REFRESH_TOKEN_EXPIRY`
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Example: '7d' (7 days)
    }
  );
};

export const User = mongoose.Model("User", userSchema);
