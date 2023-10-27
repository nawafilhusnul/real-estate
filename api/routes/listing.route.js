import express from "express";
import { createListing, deleteListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const listingRouter = express.Router();

listingRouter.post('', verifyToken, createListing);
listingRouter.delete('/:id', verifyToken, deleteListing);

export default listingRouter;
