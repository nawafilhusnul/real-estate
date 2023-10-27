import Listing from "../models/listing.model.js";
import {errorHandler} from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res
      .status(200)
      .json({
        success: true,
        message: 'Create listing successfully',
        data: listing,
      });
  } catch (e) {
    next(e);
  }
}

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return next(errorHandler(404, 'Listing not found'));

  if (req.user.id !== listing.userRef) return next(errorHandler(403, 'You can delete your own listing'));

  try {
    await Listing.findByIdAndDelete(req.params.id)
    return res
      .status(200)
      .json({
        success: true,
        message: 'Listing has been deleted successfully'
      });
  } catch (e) {
    next(e)
  }
}
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return next(errorHandler(404, 'Listing not found'));

    if (req.user.id !== listing.userRef) return next(errorHandler(403, 'You can only update your own listing'));

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    return res
      .status(200)
      .json({
        success: true,
        message: 'Listing has been updated successfully',
        data: updatedListing
      });
  } catch (e) {
    next(e)
  }
}
