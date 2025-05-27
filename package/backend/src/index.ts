import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import {typeDefs, resolvers} from './resolvers';
import { createContext } from './context';

dotenv.config();
const app = express();

async function main() {
  const server = new ApolloServer({ typeDefs, resolvers, context: createContext });
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  });
}

main();