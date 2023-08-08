import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";

import { HuggingFaceInference } from "langchain/llms/hf";

import * as dotenv from "dotenv";
import { redis, redisVectorStore } from "./redis-store";
dotenv.config();

/* const openAiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
}); */

const gepeto = new HuggingFaceInference({
  model: "bigscience/bloom",
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  temperature: 0.9,
});

const prompt = new PromptTemplate({
  template: `
    Responda a perguntar a seguir com base nas transcrições, se você não encontrar nada não tente inventar.

    Transcrições:
    {context}

    Pergunta: 
    {question}
  `.trim(),
  inputVariables: ["context", "question"],
});

const chain = RetrievalQAChain.fromLLM(gepeto, redisVectorStore.asRetriever(), {
  prompt,
});

async function main() {
  await redis.connect();

  const response = await chain.call({
    query: "Como o Google reconheceu aplicativos maliciosos ",
  });

  console.log(response);

  await redis.disconnect();
}

main();
