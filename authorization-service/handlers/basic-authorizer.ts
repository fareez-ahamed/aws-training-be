import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

export const handler: APIGatewayAuthorizerHandler = async (event) => {
  if (
    event.type !== "REQUEST" ||
    !(
      event.headers["authorization"] &&
      event.headers["authorization"].startsWith("Basic")
    )
  ) {
    return "Unauthorized";
  }

  const token = event.headers["authorization"].substring(5);
  const credentials = atob(token);
  const [username, password] = credentials.split(":");
  if (process.env.CREDENTIALS === credentials) {
    return generatePolicy(username, "Allow", event.routeArn);
  } else {
    return generatePolicy(username, "Deny", event.routeArn);
  }
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult {
  let authResponse: APIGatewayAuthorizerResult = {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return authResponse;
}
