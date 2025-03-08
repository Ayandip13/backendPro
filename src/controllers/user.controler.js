import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //inserting the `refreshToken` into database, (cause `user` is the document and we're adding the values into it)
    await user.save({ validateBeforeSave: false }); //`.save()` is a Mongoose method used to save a document (record) to the MongoDB database.

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the refresh and access token"
    );
  }
};

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
  // console.log(req.files);

  //after Uploading the file into local file or server by using multer, we'll get the localFilePath
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path;

  let coverLocalPath;

  if (
    //This block of code is used to check whether the coverImage is present(uploaded on server) or not and based on that we uploaded them into cloudinary
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    //User.create(...) is a Mongoose method that inserts a new document (user) into the users collection.
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

const loginUser = asyncHandler(async (req, res) => {
  //get the data from req body
  //username or email based login
  //find the user
  //if user is present, then check the password
  //if password is present, then generate the access and refresh token and send it to user
  //send cookie

  const { username, password, email } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    // Retrieve a single user document where either the username or email matches using `findOne()`.
    $or: [{ username }, { email }],
  });

  //User → Mongoose model (used to query the database)
  //user → Result of the query (an actual user document or null)

  if (!user) {
    throw new ApiError(404, "user doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); //`password` that we've got from the `req.body`

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //Prevents client-side JavaScript access (for security).
    secure: true, //Ensures cookies are sent only over HTTPS.
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set access token in a cookie
    .cookie("refreshToken", refreshToken, options) // Set refresh token in a cookie
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export { registerUser, loginUser };
