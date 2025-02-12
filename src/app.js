import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS with specified origin from environment variable
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from the specified origin, that is defined in `.env` file
  })
);

// Middleware to parse incoming JSON requests, with a size limit of 16KB
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data, also limited to 16KB
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Middleware to parse cookies in incoming requests
app.use(cookieParser());

export { app };