import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {
  registerUser,
  loginUser,
  saveCanvasData,
  updateCanvasData,
  getCanvasById,
  getCanvasesByUserEmail,
  getCanvasElements,
} from "./authService.js";
import { makeUsersTable } from "./db.js";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUser(email, password);
    res
      .status(200)
      .json({ status: "success", message: "Пользователь зарегистрирован" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка регистрации:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    } else {
      console.error("Неизвестная ошибка:", err);
      res.status(400).json({ status: "error", message: "Неизвестная ошибка" });
    }
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await loginUser(email, password);
    res.status(200).json({ status: "success", message: "Успешный вход" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка авторизации:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    } else {
      console.error("Неизвестная ошибка:", err);
      res.status(400).json({ status: "error", message: "Неизвестная ошибка" });
    }
  }
});

app.post("/save", async (req: Request, res: Response) => {
  const { user_email, canvasName, elements } = req.body;

  try {
    const existingCanvas = await getCanvasById(elements[0].id);
    if (existingCanvas) {
      await updateCanvasData(user_email, canvasName, elements);
    } else {
      await saveCanvasData(user_email, canvasName, elements);
    }
    res.status(200).json({ status: "success", message: "Данные сохранены" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка сохранения данных:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    } else {
      console.error("Неизвестная ошибка:", err);
      res.status(400).json({ status: "error", message: "Неизвестная ошибка" });
    }
  }
});

app.get("/canvases", async (req: Request, res: Response) => {
  const { user_email } = req.query;

  try {
    const canvases = await getCanvasesByUserEmail(user_email as string);
    res.status(200).json({ status: "success", canvases });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка получения канвасов:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    } else {
      console.error("Неизвестная ошибка:", err);
      res.status(400).json({ status: "error", message: "Неизвестная ошибка" });
    }
  }
});

app.get("/canvas-elements", async (req: Request, res: Response) => {
  const { user_email, canvas_name } = req.query;

  try {
    const elements = await getCanvasElements(
      user_email as string,
      canvas_name as string
    );
    res.status(200).json({ status: "success", elements });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка получения элементов канваса:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    } else {
      console.error("Неизвестная ошибка:", err);
      res.status(400).json({ status: "error", message: "Неизвестная ошибка" });
    }
  }
});

app.listen(port, async () => {
  await makeUsersTable();
  console.log(`Сервер запущен на http://localhost:${port}`);
});
