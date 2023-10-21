import express from 'express';
import { deleteUser, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const userRouter = express.Router();

userRouter.put('/:id', verifyToken, updateUser)
userRouter.delete('/:id', verifyToken, deleteUser)

export default userRouter;
