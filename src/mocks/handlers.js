// src/mocks/handlers.js
import { HttpResponse, http } from "msw";
import data from "./data.json";

export const handlers = [
  http.get("/api/data", () => {

    return HttpResponse.json(data);
  })

];
