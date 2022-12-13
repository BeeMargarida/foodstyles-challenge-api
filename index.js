"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, fastify_1.default)();
app.register(cors_1.default, {});
app.get("/todos", async (req, res) => {
    const { completed } = req.params;
    console.log("here");
    return await prisma.todo.findMany({
        where: completed !== null ? { completed: completed } : {}
    });
});
app.post("/todos", async (req, res) => {
    const { text, userEmail } = req.body;
    const post = await prisma.todo.create({
        data: {
            text,
            completed: false,
            user: { connect: { email: userEmail } },
        },
    });
    return post;
});
app.put("/todos/:id/complete", async (req, res) => {
    const { id } = req.params;
    const todo = await prisma.todo.update({
        where: { id: Number(id) },
        data: { completed: true },
    });
    return todo;
});
app.put("/todos/:id/incomplete", async (req, res) => {
    const { id } = req.params;
    const todo = await prisma.todo.delete({
        where: { id: Number(id) },
    });
    return todo;
});
app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const todo = await prisma.todo.delete({
        where: { id: Number(id) }
    });
    return todo;
});
app.listen({ port: 3001 }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Server ready at: http://localhost:3001`);
});
