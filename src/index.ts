import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import {
  checkPassword,
  generateAccessToken,
  hashPassword
} from "./utils";
import { validateRequest } from "./middleware";

const prisma = new PrismaClient();
const app = fastify();
app.register(cors, {});

interface SignUpBody {
  email: string;
  name: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

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

app.register(async function plugin(publicPlugin) {
  publicPlugin.post<{ Body: SignUpBody }>("/signup", async (req, res) => {
    try {
      const { email, name, password } = req.body as SignUpBody;

      const hashedPassword = await hashPassword(password);
      const { password: _, ...user } = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      const accessToken = await generateAccessToken(user);
      res.send({ data: { user }, accessToken });
    } catch (error: any) {
      res.status(400).send({ error: `User already exists` });
      console.error("Error on signup", error);
    }
  });

  publicPlugin.post<{ Body: LoginBody }>("/login", async (req, res) => {
    try {
      let { email, password } = req.body as LoginBody;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).send({ error: "Invalid email or password" });
      }

      const correctPassword = checkPassword(password, user.password);
      if (!correctPassword) {
        return res.status(401).send({ error: "Invalid email or password" });
      }

      let { password: _, ..._user } = user;
      const accessToken = await generateAccessToken(_user);

      res.send({ data: { _user }, accessToken });
    } catch (error: any) {
      res.status(400).send({ error: `Error` });
      console.error("Error on login", error);
    }
  });
});

app.register(async function plugin(privatePlugin) {
  privatePlugin.decorateRequest("user", null);
  privatePlugin.addHook('preHandler', validateRequest);

  privatePlugin.get<{ Querystring: ListTodosQuery }>(
    "/todos",
    async (req, res) => {
      const { completed } = req.query;
      const { user } = req;

      const where: Record<string, any> = {
        userId: user.id
      };
      if (completed !== undefined) {
        where.completed = completed === "true";
      }
      return await prisma.todo.findMany({
        where,
        include: { user: true }
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
          userId: user.id
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

app.listen({ port: 3001 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server ready at: http://localhost:3001`);
});
