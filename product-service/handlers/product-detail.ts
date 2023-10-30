import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getProduct } from "../products";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const product = await getProduct(event.pathParameters?.id ?? "");
    if (product === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.log("Failed", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
