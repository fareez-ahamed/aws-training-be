import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createProduct, getProducts } from "../products";
import { ZodError, z } from "zod";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const ProductSchema = z.object({
    title: z.string(),
    description: z.string(),
    count: z.number().int(),
    price: z.number(),
  });

  try {
    const productData = ProductSchema.parse(JSON.parse(event.body ?? ""));

    await createProduct(productData);
    return {
      statusCode: 200,
      body: "",
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Bad request", message: err.message }),
      };
    }
    console.error("Failed", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
