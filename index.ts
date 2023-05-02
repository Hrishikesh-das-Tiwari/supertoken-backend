import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import supertokens from "supertokens-node";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import {
  middleware,
  errorHandler,
  SessionRequest,
} from "supertokens-node/framework/express";
import { getWebsiteDomain, SuperTokensConfig } from "./config";
import {
  getMyWorkspace,
  createNewWorkspace,
  deleteUserForId,
  deleteWorkspace,
} from "./controllers/controller";

supertokens.init(SuperTokensConfig);

const app = express();

app.use(
  cors({
    origin: getWebsiteDomain(),
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

const DB = "mongodb://localhost:27017/workspace";

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

app.get("/workspace", verifySession(), getMyWorkspace);
app.post("/workspace", verifySession(), createNewWorkspace);
app.delete("/workspace/:workspaceId", verifySession(), deleteWorkspace);

app.delete("/user", verifySession(), deleteUserForId);

app.get("/getJWT", verifySession(), async (req: SessionRequest, res) => {
  let session = req.session;
  let jwt = session?.getAccessTokenPayload()["jwt"];
  res.json({ token: jwt });
});

// An example API that requires session verification
app.get("/sessioninfo", verifySession(), async (req: SessionRequest, res) => {
  let session = req.session;
  res.send({
    sessionHandle: session!.getHandle(),
    userId: session!.getUserId(),
    accessTokenPayload: session!.getAccessTokenPayload(),
  });
});

// In case of session related errors, this error handler
// returns 401 to the client.
app.use(errorHandler());

app.listen(3001, () => console.log(`API Server listening on port 3001`));
