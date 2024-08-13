import httpStatusCodes from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";

import Car from "../models/MatchingCarModels.js";
const AddMatchingCar = async (req, res, next) => {
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
};
export default AddMatchingCar;
