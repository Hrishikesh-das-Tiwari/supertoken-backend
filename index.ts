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
import { SuperTokensConfig } from "./config";
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
    origin: "https://supertoken-auth-frt2.vercel.app",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);

const DB =
  "mongodb+srv://hrishitiwari1903:nihnyj-waTkev-sagzu9@supertoken.drb5odg.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

app.get("/", (req, res) => {
  res.send("hello there!");
});

app.get(
  "/workspace",
  () => console.log("workspace"),
  // verifySession(),
  getMyWorkspace
);

app.post("/workspace", createNewWorkspace);
app.delete("/workspace/:workspaceId", verifySession(), deleteWorkspace);

app.delete("/user", verifySession(), deleteUserForId);

app.get("/getJWT", verifySession(), async (req: SessionRequest, res) => {
  let session = req.session;
  let jwt = session?.getAccessTokenPayload()["jwt"];
  return res.json({ token: jwt });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
