import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"], // Corrected error message
    },
    image: {
      type: String,
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Property" }],
  },
  {
    timestamps: true,
  }
);

// Corrected the capitalization of "User"
const User = models.User || model("User", UserSchema);

export default User;
