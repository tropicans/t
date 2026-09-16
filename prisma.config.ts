import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    datasource: {
        url: process.env.DATABASE_URL || "postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public",
    },
});
