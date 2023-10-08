import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getProducts } from "../products";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(await getProducts()),
  };
};
