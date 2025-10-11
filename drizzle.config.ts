import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./src/db/migrations",
    dialect: "sqlite",
    schema: "./src/db/schema.ts",
    dbCredentials: {
        url: "./data/portfolio.db"
    },
    verbose: true,
    strict: true,
});



