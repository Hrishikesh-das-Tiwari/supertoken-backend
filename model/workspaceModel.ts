import { Schema, model, Types } from "mongoose";
import IWorkspace from "../interfaces/IWorkspace";

const workspaceSchema = new Schema<IWorkspace>({
  name: String,
  user: String,
});

const Workspace = model<IWorkspace>("Workspace", workspaceSchema);
export default Workspace;
