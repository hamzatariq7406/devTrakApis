import httpStatusCodes from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";

import Folder from "../models/FolderModel.js";

const AddFolder = async (req, res, next) => {
  try {
    const { folderId, folderImages } = req.body;
    const folder = new Folder({
      folderId,
      folderImages,
    });

    await folder.save();
    ApiResponse.result(
      res,
      { status: "Folder Added Successfully" },
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
export default AddFolder;
