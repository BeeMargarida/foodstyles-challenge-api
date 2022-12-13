import { app, prisma } from "../app";
import { checkPassword, generateAccessToken, hashPassword } from "../utils";

interface SignUpBody {
  email: string;
  name: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
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
