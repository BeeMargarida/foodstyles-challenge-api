import { app, prisma } from "../app";
import { validateRequest } from "../middleware";

interface ListTodosQuery {
  completed?: string;
}

interface CreateTodoBody {
  text: string;
}

interface UpdateTodoParams {
  id: number;
}

interface DeleteTodoParams {
  id: number;
}

app.register(async function plugin(privatePlugin) {
  privatePlugin.decorateRequest("user", null);
  privatePlugin.addHook("preHandler", validateRequest);

  privatePlugin.get<{ Querystring: ListTodosQuery }>(
    "/todos",
    async (req, res) => {
      const { completed } = req.query;
      const { user } = req;

      const where: Record<string, any> = {
        userId: user.id,
      };
      if (completed !== undefined) {
        where.completed = completed === "true";
      }
      return await prisma.todo.findMany({
        where,
        include: { user: true },
      });
    }
  );

  privatePlugin.post<{ Body: CreateTodoBody }>("/todos", async (req, res) => {
    const { text } = req.body;
    const { user } = req;

    return await prisma.todo.create({
      data: {
        text,
        completed: false,
        user: { connect: { email: user.email } },
      },
    });
  });

  privatePlugin.put<{ Params: UpdateTodoParams }>(
    "/todos/:id/complete",
    async (req, res) => {
      const { id } = req.params;
      const { user } = req;

      return await prisma.todo.update({
        where: {
          id: Number(id),
          userId: user.id,
        },
        include: { user: true },
        data: { completed: true },
      });
    }
  );

  privatePlugin.put<{ Params: UpdateTodoParams }>(
    "/todos/:id/incomplete",
    async (req, res) => {
      const { id } = req.params;
      const { user } = req;

      return await prisma.todo.update({
        where: {
          id: Number(id),
          user: {
            email: user.email,
          },
        },
        data: { completed: false },
      });
    }
  );

  privatePlugin.delete<{ Params: DeleteTodoParams }>(
    "/todos/:id",
    async (req, res) => {
      const { id } = req.params;
      const { user } = req;

      return await prisma.todo.delete({
        where: {
          id: Number(id),
          user: {
            email: user.email,
          },
        },
      });
    }
  );
});
