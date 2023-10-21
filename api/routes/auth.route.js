import express from 'express';
import { google, signIn, signOut, signUp } from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const authRouter = express.Router();

authRouter.post('/signup', signUp)
authRouter.post('/signin', signIn)
authRouter.delete('/signout', verifyToken, signOut)
authRouter.post('/google', google)


export default authRouter;
