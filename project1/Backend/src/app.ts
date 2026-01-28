import express from "express";
import cors from "cors";
import routes from "./routes";
import aiRoutes from "./modules/ai/ai.route";
import orderRoutes from "./modules/input/input.routes";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

// Protected routes
app.use("/order", orderRoutes); 
app.use("/ai", aiRoutes); //testing purposes
app.use("/api", routes);

export default app;
