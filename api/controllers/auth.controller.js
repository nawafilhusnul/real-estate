import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import {errorHandler} from "../utils/error.js";

export const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10)
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({
      message: 'User saved successfully',
      success: true,
    })
  } catch(err) {
    next(err);
  }
}

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = User.where({ email: email });
    const user = await query.findOne();
    if (!user) {
      res.status(422).json({
        message: "User not found",
      })
      return;
    }

    const valid = bcryptjs.compareSync(password, user.password)
    if (!valid) {
      res.status(400).json({
        message: "Incorrect password",
      })
      return;
    }

    user.password = undefined;

    res.status(200).json({
      message: 'Success',
      data: user,
    })
  } catch (err) {
    res.status(500).json({
      message: "Error sign user in",
      error: err.message,
    })
  }
}
