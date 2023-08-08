import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TokenTextSplitter } from "langchain/text_splitter";
import { createClient } from "redis";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";

import * as dotenv from "dotenv";
dotenv.config();

const loader = new JSONLoader("src/tmp/content.json");

async function load() {
  const docs = await loader.load();

  const splitter = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: 600,
    chunkOverlap: 0,
  });

  const splittedDocuments = await splitter.splitDocuments(docs);

  const redis = createClient({
    url: "redis://127.0.0.1:6379",
  });

  await redis.connect();

  const model = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  });

  await RedisVectorStore.fromDocuments(splittedDocuments, model, {
    indexName: "gepeto-embeddings",
    redisClient: redis,
    keyPrefix: "gepeto",
  });

  await redis.disconnect();
}

load();
