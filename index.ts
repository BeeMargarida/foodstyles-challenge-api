import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = fastify();
app.register(cors, {});

interface ListTodosQuery {
  completed?: string;
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

app.get<{ Querystring: ListTodosQuery }>("/todos", async (req, res) => {
  const { completed } = req.query;

  return await prisma.todo.findMany({
    where: completed !== undefined ? { completed: completed === "true" } : {},
  });
});

app.post<{ Body: CreateTodoBody }>("/todos", async (req, res) => {
  const { text, userEmail } = req.body;
  return await prisma.todo.create({
    data: {
      text,
      completed: false,
      user: { connect: { email: userEmail } },
    },
  });
});

app.put<{ Params: UpdateTodoParams }>(
  "/todos/:id/complete",
  async (req, res) => {
    const { id } = req.params;
    return await prisma.todo.update({
      where: { id: Number(id) },
      data: { completed: true },
    });
  }
);

app.put<{ Params: UpdateTodoParams }>(
  "/todos/:id/incomplete",
  async (req, res) => {
    const { id } = req.params;
    return await prisma.todo.update({
      where: { id: Number(id) },
      data: { completed: false },
    });
  }
);

app.delete<{ Params: DeleteTodoParams }>("/todos/:id", async (req, res) => {
  const { id } = req.params;
  return await prisma.todo.delete({
    where: { id: Number(id) },
  });
});

app.listen({ port: 3001 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server ready at: http://localhost:3001`);
});
