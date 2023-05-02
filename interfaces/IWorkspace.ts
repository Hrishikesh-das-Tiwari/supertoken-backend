import { Types } from "mongoose";

interface IWorkspace {
  _id: Types.ObjectId;
  name: string;
  user: string;
}

export default IWorkspace;
