import { BatchWriteItemCommandInput, DynamoDB } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";
import {
  Product,
  transformToProductTableUpdate,
  transformToStockTableUpdate,
} from "../products";

const ddb = new DynamoDB({ region: "us-east-1" });

export const handler = async () => {
  if (
    process.env.PRODUCT_TABLE_NAME === undefined ||
    process.env.STOCK_TABLE_NAME === undefined
  ) {
    console.log("Environment variables not declared");
    return;
  }

  const fakeProducts = Array.from({ length: 10 }).map(newFakeProduct);

  console.log("Fake Products", fakeProducts);

  const params: BatchWriteItemCommandInput = {
    RequestItems: {
      [process.env.PRODUCT_TABLE_NAME]: fakeProducts.map(
        transformToProductTableUpdate
      ),
      [process.env.STOCK_TABLE_NAME]: fakeProducts.map(
        transformToStockTableUpdate
      ),
    },
  };

  console.log("Request Items", params.RequestItems);

  try {
    const data = await ddb.batchWriteItem(params);
    console.log("Success", data);
  } catch (error) {
    console.log("Error occurred", error);
  }
};

function newFakeProduct(): Product {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    price: faker.number.int({ min: 9, max: 99 }),
    description: faker.commerce.productDescription(),
    count: faker.number.int({ min: 5, max: 50 }),
  };
}
