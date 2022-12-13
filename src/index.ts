import { app } from "./app";

const start = async () => {
  await app.listen({ port: 3001 }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server ready at: http://localhost:3001`);
  });
};

start();
