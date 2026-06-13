import dotenv from 'dotenv';
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || '',
  NORMIES_API_URL: process.env.NORMIES_API_URL || '',
  RPC_URL: process.env.RPC_URL || '',
  NORMIES_CONTRACT_ADDRESS: process.env.NORMIES_CONTRACT_ADDRESS || '',
  NORMIES_CANVAS_ADDRESS: process.env.NORMIES_CANVAS_ADDRESS || '',
  NORMIES_DEPLOY_BLOCK: process.env.NORMIES_DEPLOY_BLOCK || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};
