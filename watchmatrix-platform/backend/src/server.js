import http from "node:http";
import app from "./app.js";
import { initSocketServer } from "./realtime/socket.js";

const port = Number(process.env.PORT || 5000);

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`watchmatrix-api running on http://localhost:${port}`);
});
