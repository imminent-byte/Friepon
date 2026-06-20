import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const app = express();
const port = process.env.PORT || 8787;
const bucket = process.env.S3_BUCKET;
const key = process.env.S3_KEY || 'referrals.json';
const currentDir = dirname(fileURLToPath(import.meta.url));
const seedReferrals = JSON.parse(
  await readFile(join(currentDir, 'seed-referrals.json'), 'utf8')
);

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

async function readReferrals() {
  if (!bucket) return seedReferrals;

  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return JSON.parse(await streamToText(response.Body));
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      await writeReferrals(seedReferrals);
      return seedReferrals;
    }

    console.warn('S3 unavailable, serving seed referrals:', error.message);
    return seedReferrals;
  }
}

async function writeReferrals(referrals) {
  if (!bucket) return referrals;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(referrals, null, 2),
      ContentType: 'application/json'
    })
  );
  return referrals;
}

app.get('/api/referrals', async (_request, response) => {
  response.json(await readReferrals());
});

app.post('/api/referrals', async (request, response) => {
  const referrals = await readReferrals();
  const item = {
    id: `${request.body.name || 'brand'}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: String(request.body.name || '').trim(),
    category: String(request.body.category || 'Other').trim(),
    code: String(request.body.code || '').trim().toUpperCase(),
    reward: String(request.body.reward || '').trim(),
    description: String(request.body.description || '').trim(),
    verified: false,
    featured: false,
    image: String(request.body.image || '').trim()
  };

  if (!item.name || !item.code || !item.reward) {
    return response.status(400).json({ message: 'Name, code, and reward are required.' });
  }

  const updated = [item, ...referrals];
  await writeReferrals(updated);
  response.status(201).json(item);
});

app.listen(port, () => {
  console.log(`Friepon API running on http://127.0.0.1:${port}`);
});
