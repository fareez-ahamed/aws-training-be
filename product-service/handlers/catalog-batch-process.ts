import { SQSHandler } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Product, createProduct } from "../products";
import { z } from "zod";

const productSchema = z.object({
  count: z.number(),
  description: z.string(),
  price: z.number(),
  title: z.string(),
});
export const handler: SQSHandler = async (event) => {
  console.log(`Received ${event.Records.length} items for process`);
  const productsArray = event.Records.map((record) =>
    JSON.parse(record.body)
  ) as Omit<Product, "id">[];

  console.log(`Creating promises`);
  const promiseArray = productsArray.map((product) => {
    try {
      const validatedProduct = productSchema.parse(product);
      return createProduct(validatedProduct);
    } catch (error) {
      console.log("Validation error", error);
    }
  });

  console.log(`Waiting for all promises to complete`);
  await Promise.all(promiseArray);

  const snsClient = new SNSClient({ region: "us-east-1" });
  snsClient.send(
    new PublishCommand({
      TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN!,
      Subject: "New Products Created",
      Message: `Created ${productsArray.length} new products`,
    })
  );
  console.log(`Published notification`);
};
