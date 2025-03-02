import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //Steps to register the user :-
  //get the user details from user
  //validate that username, email all require fields are correct or not
  //check if user already exists or not.. (we can check it by using unique username or unique email)
  //check for images are present or not, check for avatar
  //upload them to cloudinary
  //create user object.. ( after uploading the images on cloudinary we've get a cloudinary image url and using image, username and email we'll create an object, because mongodb is nosql database so it always accept the objects)
  //and then we'll create entry in db
  //remove password and refresh token field from response
  //check for user creation (whether the user has been created or not basis of response)
  //return response

  const { username, fullname, email, password } = req.body; //getting the userDetails from user
  console.log("email", email);

  //bit of advance code but working is same which is to check the all fields are presents or not either it will throw an error and status code
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!email.includes("@")) throw new ApiError(400, "Email is not valid");

  const existedUser = User.findOne({  //This is a Mongoose method that searches for a single document in the MongoDB database.
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

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })//Creates an object that has the specified prototype or that has null prototype.

  const createdUser = await User.findById(user.__id)


  // if (fullname === "") {
  //   throw new ApiError(400, "fullname is required")
  // }
});

export { registerUser };
