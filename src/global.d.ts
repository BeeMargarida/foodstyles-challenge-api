import fastify from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user: { id: number; email: string; name: string };
  }
}
