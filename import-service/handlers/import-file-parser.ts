import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import csv from "csv-parser";
import { transformSync } from "esbuild";
import { ZodError, z } from "zod";

interface Product {
  count: number;
  description: string;
  price: number;
  title: string;
}

const productSchema = z.object({
  count: z.coerce.number(),
  description: z.string(),
  price: z.coerce.number(),
  title: z.string(),
});

export const handler = async (event: S3Event) => {
  if (event.Records.length === 0) {
    console.error("No records in event", event);
    return;
  }

  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  try {
    const s3Client = new S3Client({ region: "us-east-1" });
    const result = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
    );

    if (result.Body === undefined) {
      console.error("Unable to read stream", event);
      return;
    }

    const objectStream = result.Body as NodeJS.ReadableStream;

    const data = await handleStream(objectStream);

    await s3Client.send(
      new CopyObjectCommand({
        CopySource: `${bucketName}/${objectKey}`,
        Bucket: bucketName,
        Key: `parsed/${objectKey.split("/")[1]}`,
      })
    );

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );
  } catch (err) {
    console.error("Failed", err);
  }
};

const handleStream = (stream: NodeJS.ReadableStream) => {
  return new Promise((resolve, reject) => {
    const client = new SQSClient({ region: "us-east-1" });
    const dataArray: unknown[] = [];
    stream
      .pipe(csv())
      .on("data", (data) => {
        try {
          console.log("Data from csv", data);
          const transformedData: Product = productSchema.parse(data);
          client.send(
            new SendMessageCommand({
              QueueUrl:
                "https://sqs.us-east-1.amazonaws.com/396572677717/aws-training-catalog-items-queue",
              MessageBody: JSON.stringify(transformedData),
            })
          );
          dataArray.push(transformedData);
        } catch (error) {
          if (error instanceof ZodError) {
            console.log("Validation error", error);
          } else {
            console.log("Unknown error", error);
          }
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve(dataArray);
      });
  });
};
