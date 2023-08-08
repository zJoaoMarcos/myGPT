import { createClient } from "redis";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";

export const redis = createClient({
  url: "redis://127.0.0.1:6379",
});

const model = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
});

export const redisVectorStore = new RedisVectorStore(model, {
  indexName: "gepeto-embeddings",
  redisClient: redis,
  keyPrefix: "gepeto",
});
