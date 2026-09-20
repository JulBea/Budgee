import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import accountsRouter from "./routes/accounts";
import authRouter from "./routes/auth";
import bankConnectionsRouter from "./routes/bankConnections";
import billsRouter from "./routes/bills";
import bridgeWebhookRouter from "./routes/bridgeWebhook";
import budgetsRouter from "./routes/budgets";
import categoriesRouter from "./routes/categories";
import familyMembersRouter from "./routes/familyMembers";
import goalsRouter from "./routes/goals";
import reportsRouter from "./routes/reports";
import transactionsRouter from "./routes/transactions";
import { seedDefaultCategories } from "./seed";
import { sessionMiddleware } from "./session";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// Filet de sécurité : une erreur async oubliée ailleurs ne doit jamais
// faire planter tout le process (et donc couper tous les utilisateurs).
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

const app = express();
const port = process.env.PORT ?? 4000;

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Doit recevoir le corps brut (non parsé) pour vérifier la signature HMAC
// Bridge avant tout middleware JSON global.
app.use("/api/webhooks/bridge", express.raw({ type: "application/json" }), bridgeWebhookRouter);

app.use(express.json());
app.use(sessionMiddleware);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/bank-connections", bankConnectionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/bills", billsRouter);
app.use("/api/family-members", familyMembersRouter);
app.use("/api/reports", reportsRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Une erreur interne est survenue" });
};
app.use(errorHandler);

seedDefaultCategories().catch((err) => console.error("Failed to seed default categories:", err));

app.listen(port, () => {
  console.log(`Budgee API listening on http://localhost:${port}`);
});
