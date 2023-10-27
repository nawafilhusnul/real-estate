import express from 'express';
import { deleteUser, updateUser, getUserListings } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const userRouter = express.Router();

userRouter.put('/:id', verifyToken, updateUser)
userRouter.delete('/:id', verifyToken, deleteUser)
userRouter.get('/listings/:id', verifyToken, getUserListings)

export default userRouter;
