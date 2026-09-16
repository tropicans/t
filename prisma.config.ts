export default {
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL || "postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public",
    },
};
