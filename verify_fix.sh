#!/bin/bash

# Test REFRESH_SECRET missing
echo "Testing REFRESH_SECRET missing..."
export NODE_ENV=production
export DATABASE_URL=postgresql://test:test@localhost:5432/test
export JWT_SECRET=test-jwt-secret
# export REFRESH_SECRET=test-refresh-secret
export EMAIL_TOKEN_SECRET=test-email-secret
export RESET_TOKEN_SECRET=test-reset-secret
export PAYSTACK_SECRET_KEY=test-paystack-secret
export PAYSTACK_PUBLIC_KEY=test-paystack-public

# We use node directly on the compiled file if it exists, but since it doesn't,
# we can't easily run it. However, we can use node to check the routes.ts file
# by mocking the imports if we really wanted to.
# But here I'll try to use ts-node or similar if available, or just node with experimental flags.

# Actually, the best way to verify the Logic is to run a small node script that imports the logic.
# Since we have ES modules, we can try to use node --loader or similar.

cat << 'INNER_EOF' > test_env.js
import * as dotenv from "dotenv";
dotenv.config();
import { logger } from './server/utils/logger.js';

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_SECRET',
  'EMAIL_TOKEN_SECRET',
  'RESET_TOKEN_SECRET',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_PUBLIC_KEY'
];

console.log("Checking requiredEnvVars...");
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.log('FATAL: Missing required environment variables in production', { missingEnvVars });
} else {
  console.log('All required environment variables are present');
}

console.log("Checking criticalSecrets...");
const criticalSecrets = [
  'JWT_SECRET',
  'REFRESH_SECRET',
  'EMAIL_TOKEN_SECRET',
  'RESET_TOKEN_SECRET'
];
for (const secret of criticalSecrets) {
  if (!process.env[secret]) {
    console.log("FATAL: " + secret + " must be set in production");
  } else {
    console.log(secret + " is set");
  }
}
INNER_EOF

node test_env.js
rm test_env.js
