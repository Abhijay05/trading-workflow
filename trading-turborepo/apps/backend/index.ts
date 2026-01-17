import { UserModel } from "db";
import express from "express";
import mongoose from "mongoose";
import { SignupSchema } from "packages/common/types";
mongoose.connect(process.env.MONGO_URL!);

const app = express();

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
