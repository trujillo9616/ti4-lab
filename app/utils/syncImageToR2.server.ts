import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET_NAME = "ti4-lab-images";
const missingR2EnvironmentVariablesError =
  "Missing R2 environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
};

let s3Client: S3Client | null = null;

export function canSyncImagesToR2() {
  return Boolean(getR2Config());
}

function getR2Config(): R2Config | null {
  if (process.env.R2_INTEGRATION_DISABLED === "true") {
    return null;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    publicUrl,
  };
}

function requireR2Config(): R2Config {
  const config = getR2Config();
  if (!config) {
    throw new Error(missingR2EnvironmentVariablesError);
  }
  return config;
}

function getS3Client(config: R2Config) {
  if (s3Client) {
    return s3Client;
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return s3Client;
}

export async function syncImageToR2(
  draftId: string,
  imageBuffer: Buffer,
  status: "complete" | "incomplete" = "complete",
): Promise<string> {
  const suffix = status === "incomplete" ? "-incomplete" : "";
  return syncPngToR2(`drafts/${draftId}${suffix}.png`, imageBuffer);
}

export async function syncPresetMapImageToR2(
  presetMapId: string,
  imageBuffer: Buffer,
): Promise<string> {
  return syncPngToR2(`preset-maps/${presetMapId}.png`, imageBuffer);
}

async function syncPngToR2(key: string, imageBuffer: Buffer): Promise<string> {
  const config = requireR2Config();
  const client = getS3Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
    }),
  );

  return `${config.publicUrl}/${key}`;
}
