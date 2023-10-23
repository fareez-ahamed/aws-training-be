import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ZodError, z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const querySchema = z.object({
    name: z.string(),
  });

  try {
    const { name } = querySchema.parse(event.queryStringParameters);
    const s3Client = new S3Client({ region: "us-east-1" });
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: "aws-training-import-service-uploads",
        Key: `uploaded/${name}`,
        ContentType: "text/csv",
      })
    );
    return {
      statusCode: 200,
      body: signedUrl,
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
