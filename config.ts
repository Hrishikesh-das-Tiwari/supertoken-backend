import ThirdPartyPasswordless from "supertokens-node/recipe/thirdpartypasswordless";
import Session from "supertokens-node/recipe/session";
import { TypeInput } from "supertokens-node/types";
import Dashboard from "supertokens-node/recipe/dashboard";
import User from "./model/userModel";
import randomWords from "random-words";

export function getApiDomain() {
  return "https://supertoken-backend-production-a15a.up.railway.app";
}

export function getWebsiteDomain() {
  return "https://supertoken-auth-frt2.vercel.app/";
}

export const SuperTokensConfig: TypeInput = {
  framework: "express",
  supertokens: {
    // These are the connection details of the app you created on supertokens.com
    connectionURI:
      "https://dev-1c0a8771e8ff11edb9b8b90a35a84dea-eu-west-1.aws.supertokens.io:3570",
    apiKey: "JSYN4bLubgvKvv8CHuO9InTaWPCJH=",
  },
  appInfo: {
    appName: "Supertoken Workspace",
    apiDomain: "https://supertoken-backend-production-a15a.up.railway.app",
    websiteDomain: "https://supertoken-auth-frt2.vercel.app/",
    apiBasePath: "/api/auth",
  },
  // recipeList contains all the modules that you want to
  // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
  recipeList: [
    ThirdPartyPasswordless.init({
      providers: [
        ThirdPartyPasswordless.Google({
          clientId:
            "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
          clientSecret: "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",
        }),
        ThirdPartyPasswordless.Github({
          clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
          clientId: "467101b197249757c71f",
        }),
        ThirdPartyPasswordless.Apple({
          clientId: "4398792-io.supertokens.example.service",
          clientSecret: {
            keyId: "7M48Y4RYDL",
            privateKey:
              "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
            teamId: "YWQCXGJRJL",
          },
        }),
      ],
      contactMethod: "EMAIL_OR_PHONE",
      flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            // override the thirdparty sign in / up API
            thirdPartySignInUpPOST: async function (input) {
              if (originalImplementation.thirdPartySignInUpPOST === undefined) {
                throw Error("Should never come here");
              }

              // TODO: Some pre sign in / up logic

              let response =
                await originalImplementation.thirdPartySignInUpPOST(input);

              if (response.status === "OK") {
                if (response.createdNewUser) {
                  // TODO: User is New User so Create a workspace for him
                  const word = randomWords(1);
                  const user = await User.create({
                    userId: response.user.id,
                    email: response.user.email,
                    workspace: [word],
                  });
                }
              }

              return response;
            },

            consumeCodePOST: async (input) => {
              if (originalImplementation.consumeCodePOST === undefined) {
                throw Error("Should never come here");
              }

              // First we call the original implementation of consumeCodePOST.
              const response = await originalImplementation.consumeCodePOST(
                input
              );

              // Post sign up response, we check if it was successful
              if (response.status === "OK") {
                let userId, phoneNumber, email;
                if ("phoneNumber" in response.user) {
                  const { id, phoneNumber: pNo } = response.user;
                  userId = id;
                  phoneNumber = pNo;
                } else {
                  const { id, email: em } = response.user;
                  userId = id;
                  email = em;
                }

                if (response.createdNewUser) {
                  // TODO: User is New User so Create a workspace for him
                  const word = randomWords(1);
                  await User.create({
                    userId,
                    email,
                    phoneNumber,
                    workspace: [word],
                  });
                }
              }
              return response;
            },
          };
        },
      },
    }),
    Session.init({
      jwt: {
        enable: true,
      },
    }),
    Dashboard.init(),
  ],
};
