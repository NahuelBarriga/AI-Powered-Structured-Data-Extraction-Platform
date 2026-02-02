import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import aiRoutes from "./modules/ai/ai.route";
import orderRoutes from "./modules/input/input.routes";
import authRoutes from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";



const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


app.use(
    cors({
        origin: "http://localhost:3001", // origin
        credentials: true,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(cookieParser());
app.use(express.json());


// Protected routes
app.use("/api/order", orderRoutes); 
// app.use("/ai", aiRoutes); //testing purposes
app.use("/api/onboard", authRoutes)
app.use("/api", routes);

export default app;
