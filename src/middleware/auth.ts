import { FastifyReply, FastifyRequest } from "fastify";
import { validateAccessToken } from "../utils";

export function validateRequest(
  req: FastifyRequest,
  res: FastifyReply,
  next: () => void
) {
  let auth = req.headers["authorization"];
  let token = auth?.replace("Bearer ", "");

  validateAccessToken(token ?? "")
    .then((user) => {
      req.user = user as { id: number; email: string; name: string };
      next();
    })
    .catch(() => {
      return res.status(401).send({ error: "Unauthorized!" });
    });
}
