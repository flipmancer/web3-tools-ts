import dotenv from "dotenv";
dotenv.config();

// Set the NODE_ENV to 'test' for testing environment
process.env.NODE_ENV = "test";

// Quiet logs during tests
process.env.LOG_LEVEL = "silent";
