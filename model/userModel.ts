import Workspace from "./workspaceModel";
import mongoose from "mongoose";
import randomWords from "random-words";

const userSchema = new mongoose.Schema({
  userId: String,
  phoneNumber: String,
  email: String,
});

userSchema.post("save", async function (doc) {
  try {
    const newWorkspace = {
      name: randomWords(1)[0],
      user: doc.userId,
    };
    await Workspace.create(newWorkspace);
  } catch (error) {
    console.log(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
