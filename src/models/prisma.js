require("dotenv").config();

// console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pkg = require("pg");
const { PrismaClient } = require("../generated");
const { PrismaPg } = require("@prisma/adapter-pg");

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;