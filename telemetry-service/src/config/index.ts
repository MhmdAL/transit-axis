import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3003,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://telemetry_user:telemetry_password@localhost:5433/moveo_telemetry'
};

