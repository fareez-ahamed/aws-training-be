import { BatchWriteItemCommandInput, DynamoDB } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";

const ddb = new DynamoDB({ region: "us-east-1" });
export interface Product {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
}

export async function getProducts(): Promise<Product[]> {
  const { Items: products } = await ddb.scan({
    TableName: process.env.PRODUCT_TABLE_NAME,
    Limit: 100,
  });
  const { Items: productCounts } = await ddb.scan({
    TableName: process.env.STOCK_TABLE_NAME,
    Limit: 100,
  });

  const productsById = new Map<string, Product>();

  console.log("Products", products);

  products?.forEach((item) =>
    productsById.set(item.id.S as string, {
      id: item.id.S as string,
      title: item.title.S as string,
      description: item.description.S as string,
      price: Number(item.price.N),
      count: 0,
    })
  );

  productCounts?.forEach((item) => {
    const product = productsById.get(item.product_id.S as string);
    if (product) {
      product.count = Number(item.count.N);
    }
  });

  return Array.from(productsById.values());
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const product = await ddb.getItem({
    TableName: process.env.PRODUCT_TABLE_NAME,
    Key: {
      id: {
        S: id,
      },
    },
  });
  const productCount = await ddb.getItem({
    TableName: process.env.STOCK_TABLE_NAME,
    Key: {
      product_id: {
        S: id,
      },
    },
  });
  if (product.Item === undefined) {
    return undefined;
  }
  return {
    id: product.Item.id.S as string,
    title: product.Item.title.S as string,
    description: product.Item.description.S as string,
    price: Number(product.Item.price.N),
    count: Number(productCount.Item?.count.N ?? "0"),
  };
}

export async function createProduct(
  product: Omit<Product, "id">
): Promise<void> {
  if (
    process.env.PRODUCT_TABLE_NAME === undefined ||
    process.env.STOCK_TABLE_NAME === undefined
  ) {
    console.error("Environment variables not declared");
    return;
  }

  const newProduct = {
    id: uuid(),
    ...product,
  };

  const params: BatchWriteItemCommandInput = {
    RequestItems: {
      [process.env.PRODUCT_TABLE_NAME]: [
        transformToProductTableUpdate(newProduct),
      ],
      [process.env.STOCK_TABLE_NAME]: [transformToStockTableUpdate(newProduct)],
    },
  };

  console.log("Request Items", params.RequestItems);

  try {
    const data = await ddb.batchWriteItem(params);
    console.log("Success", data);
  } catch (error) {
    console.error("Error occurred", error);
  }
}

export function transformToProductTableUpdate(p: Product) {
  return {
    PutRequest: {
      Item: {
        id: {
          S: p.id,
        },
        title: {
          S: p.title,
        },
        price: {
          N: p.price.toPrecision(2),
        },
        description: {
          S: p.description,
        },
      },
    },
  };
}

export function transformToStockTableUpdate(p: Product) {
  return {
    PutRequest: {
      Item: {
        product_id: {
          S: p.id,
        },
        count: {
          N: p.count.toString(),
        },
      },
    },
  };
}
