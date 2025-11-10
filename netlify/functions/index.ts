import { Hono } from 'hono';
import { createRequestHandler, RouterContextProvider } from 'react-router';

// @ts-expect-error - virtual module provided by React Router at build time
// import * as build from 'virtual:react-router/server-build';
import * as build from "../../build/server/index.js"

// declare module 'react-router' {
//   interface AppLoadContext {
//     VALUE_FROM_HONO: string;
//   }
// }

const app = new Hono();

// Add any additional Hono middleware here

const handler = createRequestHandler(build);
app.mount('/', (req) =>
  handler(req, new RouterContextProvider()),
);

export default app.fetch;
