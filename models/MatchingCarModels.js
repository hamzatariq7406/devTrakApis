import { Schema, model } from "mongoose";
const MatchingCarSchema = Schema(
  {
    primaryFolderId: {
      type: Number,
      required: true,
    },
    secondaryFolderId: {
      type: Number,
    },
    primaryThumbnail: {
      type: String,
    },
    secondaryThumbnail: {
      type: String,
    },
    similarityPercentage: {
      type: String,
    },
    vedioReference: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Car", MatchingCarSchema);
