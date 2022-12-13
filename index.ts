import fastify from "fastify";
import cors from '@fastify/cors'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = fastify();
app.register(cors, {})

interface ListTodosParams {
    completed?: boolean;
}

interface CreateTodoBody {
    text: string;
    userEmail: string;
}

interface UpdateTodoParams {
    id: number;
}

interface DeleteTodoParams {
    id: number;
}

app.get<{ Params: ListTodosParams }>("/todos", async (req, res) => {
  const { completed } = req.params;
  console.log("here");
  
  return await prisma.todo.findMany({
    where: completed !== null ? { completed: completed } : {}
  });
});

app.post<{ Body: CreateTodoBody }>("/todos", async (req, res) => {
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

app.put<{ Params: UpdateTodoParams }>("/todos/:id/complete", async (req, res) => {
  const { id } = req.params;
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { completed: true },
  });
  return todo;
});

app.put<{ Params: UpdateTodoParams }>("/todos/:id/incomplete", async (req, res) => {
  const { id } = req.params;
  const todo = await prisma.todo.delete({
    where: { id: Number(id) },
  });
  return todo;
});

app.delete<{ Params: DeleteTodoParams }>("/todos/:id", async (req, res) => {
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
