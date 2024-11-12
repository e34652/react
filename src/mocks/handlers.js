// src/mocks/handlers.js
import { rest } from "msw";
import data from "./data.json";

export const handlers = [
  rest.get("/data", (req, res, ctx) => {
    return res(ctx.json(data));
  }),
];
