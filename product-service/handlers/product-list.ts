import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getProducts } from "../products";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await getProducts()),
    };
  } catch (err) {
    console.log("Failed", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
