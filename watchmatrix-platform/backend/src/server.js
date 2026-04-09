import http from "node:http";
import app from "./app.js";
import { initSocketServer } from "./realtime/socket.js";
import { logger } from "./utils/logger.js";

const port = Number(process.env.PORT || 5000);

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`watchmatrix-api running on http://localhost:${port}`);
});

process.on("unhandledRejection", (reason) => {
  logger.alert("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
});

process.on("uncaughtException", (error) => {
  logger.alert("Uncaught exception", {
    message: error.message,
    stack: error.stack
  });
});
