import { Schema, model } from "mongoose";

const FolderSchema = Schema(
  {
    folderId: {
      type: Number,
      required: true,
    },
    folderImages: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Folder", FolderSchema);
