import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export const app = fastify();

app.register(cors, {});
