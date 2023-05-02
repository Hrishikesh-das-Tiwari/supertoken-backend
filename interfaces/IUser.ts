import { Types } from "mongoose";

interface IUser {
  _id: Types.ObjectId;
  userId: string;
  email?: string;
  phoneNumber?: string;
}

export default IUser;
