import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {
  //Steps to register the user :-
  //get the user details from user
  //validate that username, email all require fields are correct or not
  //check if user user already exists or not.. (we can check it by using unique username or unique email)
  //check for images are present or not, check for avatar
  //upload them to cloudinary
  //create user object.. ( after uploading the images on cloudinary we've get a cloudinary image url and using image, username and email we'll create an object, because mongodb is nosql database so it always accept the objects)
  //and then we'll create entry in db
  //remove password and refresh token field from response
  //check for user creation (whether the user has been created or not basis of response)
  //return response

  const { username, fullname, email, password } = req.body;
  console.log("email", email);


  //bit of advance code but working is same which is to check the all fields are presents or not either it will throw an error and status code
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // if (fullname === "") {
  //   throw new ApiError(400, "fullname is required")
  // }
});

export { registerUser };
