import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express()

app.use(cors())

app.use(express.json())

app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return res.status(401).json({
          message: "Invalid token. Please login again",
        });
      }

      req.user = decoded;
      next();
    });
  } else {
    next();
  }
});

const connectionString = process.env.MONGO_URI

mongoose.connect(connectionString).then(
    () => {
        console.log("Database connected")
    }
).catch(
    () => {
        console.log("Database connection failed ")
    }
)

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)

app.listen(5000,
    () => {
        console.log("Server is running on port 5000")
    }
)