import express from "express";
import cors from "cors";
import routes from "./routes";
import aiRoutes from "./modules/ai/ai.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);
app.use("/api", routes);

export default app;
