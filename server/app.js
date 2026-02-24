import express from "express";
import cors from "cors";
import "dotenv/config";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/index.js";
//import sequelize from "./config/database.js";

const app = express();

// middlewares globais
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(helmet());

//Limite de requisições
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message:
    "Muitas requisições a partir deste IP, por favor tente novamente após 10 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);

// rotas
app.use(routes);

/*
(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Banco de dados sincronizado");
  } catch (err) {
    console.error("Erro ao sincronizar o banco:", err);
  }
})();

*/

export default app;
