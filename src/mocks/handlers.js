// src/mocks/handlers.js
import { HttpResponse, http } from "msw";
import data from "./data.json";

export const handlers = [
  http.get("/data", (req, res, ctx) => {
    return res(ctx.json(data));
  }),
  http.get("/data/sections", (req, res, ctx) => {
    return res(ctx.json(data.sections)); // sections 데이터만 반환
  }),
  http.get("/data/statistics", (req, res, ctx) => {
    return res(ctx.json(data.statistics)); // statistics 데이터만 반환
  }),
];
