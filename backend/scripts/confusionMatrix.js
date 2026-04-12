import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Doubt from '../models/Doubt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try backend/.env first, then project/.env.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI/MONGO_URI in environment');
  }

  await mongoose.connect(mongoUri);

  const docs = await Doubt.find(
    { status: { $in: ['submitted', 'resolved', 'disputed'] } },
    'status slaBreached studentRating reopenCount'
  ).lean();

  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  let total = 0;

  for (const d of docs) {
    // Predicted efficient: system completed in resolved state without SLA breach.
    const predictedEfficient = d.status === 'resolved' && !d.slaBreached;

    // Actual efficient: if rating exists use rating>=4 and not reopened, else fallback to resolved and not reopened.
    const hasRating = typeof d.studentRating === 'number';
    const actualEfficient = hasRating
      ? d.studentRating >= 4 && (d.reopenCount || 0) === 0
      : d.status === 'resolved' && (d.reopenCount || 0) === 0;

    if (predictedEfficient && actualEfficient) tp += 1;
    else if (predictedEfficient && !actualEfficient) fp += 1;
    else if (!predictedEfficient && actualEfficient) fn += 1;
    else tn += 1;

    total += 1;
  }

  const accuracy = total ? (tp + tn) / total : 0;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  console.log(
    JSON.stringify(
      {
        total,
        confusionMatrix: {
          TP: tp,
          FP: fp,
          FN: fn,
          TN: tn,
        },
        metrics: {
          accuracy,
          precision,
          recall,
          f1,
        },
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Failed to compute confusion matrix:', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
