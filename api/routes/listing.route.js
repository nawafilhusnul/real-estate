import express from "express";
import { createListing, deleteListing, getListing, updateListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const listingRouter = express.Router();

listingRouter.post('', verifyToken, createListing);
listingRouter.delete('/:id', verifyToken, deleteListing);
listingRouter.put('/:id', verifyToken, updateListing);
listingRouter.get('/:id', verifyToken, getListing);

export default listingRouter;
