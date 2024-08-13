import httpStatusCodes from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";

import Car from "../models/MatchingCarModels.js";
const AddMatchingCar = async (req, res, next) => {
  try {
    const {
      primaryFolderId,
      secondaryFolderId,
      primaryThumbnail,
      secondaryThumbnail,
      similarityPercentage,
      vedioReference,
    } = req.body;

    const matchingCar = new Car({
      primaryFolderId,
      secondaryFolderId,
      primaryThumbnail,
      secondaryThumbnail,
      similarityPercentage,
      vedioReference,
    });
    await matchingCar.save();

    ApiResponse.result(
      res,
      { status: "Car Added Successfully" },
      httpStatusCodes.OK
    );
  } catch (err) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      err,
      httpStatusCodes.BAD_REQUEST
    );
  }
};
export default AddMatchingCar;
