import "dotenv/config";
import { UserModel } from "db";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SignupSchema, SigninSchema } from "packages/common/types";
mongoose.connect(process.env.MONGO_URL!);
const JWT_SECRET = process.env.JWT_SECRET!;

const app = express();
app.use(express.json());
console.log("MONGO_URL =", process.env.MONGO_URL);

app.post("/signup", async (req, res) => {
  const { success, data } = SignupSchema.safeParse(req.body);
  if (!success) {
    res.status(403).json({
      message: "incorrect inputs",
    });
    return;
  }
  try {
    const user = await UserModel.create({
      username: data.username,
      password: data.password,
    });
    res.json({
      id: user._id,
    });
  } catch (e) {
    res.status(411).json({
      messsage: "username already exists",
    });
  }
});

app.post("/signin", async (req, res) => {
  const { success, data } = SigninSchema.safeParse(req.body);
  if (!success) {
    return;
  }
  try {
    const user = await UserModel.findOne({
      username: data.username,
      password: data.password,
    });

    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
      );
      res.json({
        id: user._id,
        token,
      });
    } else {
      res.status(403).json({
        message: "user doesnt exist",
      });
    }
  } catch (e) {
    res.status(411).json({
      messsage: "username already exists",
    });
  }
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
