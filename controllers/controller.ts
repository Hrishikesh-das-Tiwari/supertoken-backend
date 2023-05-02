import { SessionRequest } from "supertokens-node/framework/express";
import { NextFunction, Response } from "express";
import { deleteUser } from "supertokens-node";
import JsonWebToken, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import randomWords from "random-words";
import Workspace from "../model/workspaceModel";

const AppError = require("../util/appError");

const client = jwksClient({
  jwksUri:
    "https://supertoken-backend-production-a15a.up.railway.app/auth/jwt/jwks.json",
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key!.getPublicKey();
    callback(err, signingKey);
  });
}

function verifyJWT(req: SessionRequest, res: Response) {
  let session = req.session;
  let jwt = session?.getAccessTokenPayload()["jwt"];

  if (!jwt) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  JsonWebToken.verify(jwt, getKey, {}, function (err, decoded) {
    if (err) {
      return res.status(401).json({ message: "Invalid JWT" });
    }
  });
}

export const getMyWorkspace = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // verifyJWT(req, res);
    let userId = req!.session!.getUserId();
    const myWorkspace = await Workspace.find({ user: userId });

    res.status(200).json({
      userId,
      myWorkspace,
    });
  } catch (error) {
    return next(
      new AppError("Cannot get your workspace! Please try again", 404)
    );
  }
};

export const createNewWorkspace = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // verifyJWT(req, res);
    let userId = req!.session!.getUserId();
    await Workspace.create({
      name: randomWords(1)[0],
      user: userId,
    });
    const myWorkspace = await Workspace.find({ user: userId });

    res.status(200).json({
      userId,
      myWorkspace,
    });
  } catch (error: any) {
    return next(new AppError(error.name, error.status));
  }
};

export const deleteWorkspace = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    verifyJWT(req, res);
    let userId = req!.session!.getUserId();

    await Workspace.findByIdAndDelete(workspaceId);
    const myWorkspace = await Workspace.find({ user: userId });

    res.status(200).json({
      userId,
      myWorkspace,
    });
  } catch (error: any) {
    return next(new AppError(error.name, error.status));
  }
};

export const deleteUserForId = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  verifyJWT(req, res);
  try {
    let userId = req!.session!.getUserId();
    await deleteUser(userId); // this will succeed even if the userId didn't exist.
    res.status(202).json({
      status: "success",
      userId,
    });
  } catch (error) {
    return next(new AppError("Something went wrong! Please Try Again", 404));
  }
};
