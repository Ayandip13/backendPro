import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //Steps to register the user :-
  //Get the user details from the request body (frontend).
  //validate that username, email all require fields are correct or not
  //Check if a user with the same username or email already exists.
  //Verify if avatar and cover image files are provided.
  // Upload the avatar and cover image to Cloudinary.
  //create user object.. ( after uploading the images on cloudinary we've get a cloudinary image url and using image, username and email we'll create an object, because mongodb is nosql database so it always accept the objects)
  // Save the user object in the database.
  // Remove sensitive fields (password and refresh token) before sending a response.
  // Ensure that the user is successfully created before returning a response.
  //return response

  const { username, fullName, email, password } = req.body; //getting the userDetails from user
  console.log("email", email);

  //bit of advance code but working is same which is to check the all fields are presents or not either it will throw an error and status code
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!email.includes("@")) throw new ApiError(400, "Email is not valid");

  // if (fullname === "") {
  //   throw new ApiError(400, "fullname is required")
  // }

  const existedUser = await User.findOne({
    //This is a Mongoose method that searches for a single document in the MongoDB database.
    $or: [{ username }, { email }], //This is a MongoDB query operator that matches either of the conditions inside the array.
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //after Uploading the file into local file or server by using multer, we'll get the localFilePath
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    //we ware just storing the referance into user variable
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  }); //Creates an object that has the specified prototype or that has null prototype.

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //By using select() we ensure that these sensitive fields are excluded from the response when retrieving the created user from the database.
  ); //findById() help us to find the entry by checking id field, which is autometically created by mongoDB for every entry

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.json(
    new ApiResponse(200, createdUser, "User registered succesfully")
  );
});

export { registerUser };
