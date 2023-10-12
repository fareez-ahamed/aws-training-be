import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";

const ddb = new DynamoDB({ region: "us-east-1" });
export interface Product {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
}

const PRODUCTS: Product[] = [
  {
    count: 4,
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 2.4,
    title: "ProductOne",
  },
  {
    count: 6,
    description: "Short Product Description3",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
    price: 10,
    title: "ProductNew",
  },
  {
    count: 7,
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
    price: 23,
    title: "ProductTop",
  },
  {
    count: 12,
    description: "Short Product Description7",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductTitle",
  },
  {
    count: 7,
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Product",
  },
  {
    count: 8,
    description: "Short Product Description4",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "ProductTest",
  },
  {
    count: 2,
    description: "Short Product Descriptio1",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Product2",
  },
  {
    count: 3,
    description: "Short Product Description7",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductName",
  },
];

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
