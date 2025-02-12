// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("DB connection Failed !", error);
  });

/*
const app = express()


(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);    //this is the syntax to connect the database, and we always need to wrap that into try catch block..

    app.on("error", () => {           //on() is method is express that is used to listen for custom or built-in events in Node.js. `error` is just a built-in event     
      console.log("Error", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
        console.log(`App is listning on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
})();*/
