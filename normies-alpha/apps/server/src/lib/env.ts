import dotenv from 'dotenv';

dotenv.config();

const rawEnv = process.env as Record<string, string | undefined>;

export const env = {
  ...rawEnv,
  PORT: rawEnv.PORT || '4000',
  NODE_ENV: rawEnv.NODE_ENV || 'development',
};

export default env;
