import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { registerUser, loginUser } from './authService.js';
import { resetUsersTable } from './db.js';

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Роут для регистрации
app.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUser(email, password);
    res.status(200).json({ status: 'success', message: 'Пользователь зарегистрирован' });
  } catch (err: unknown) {  // Уточняем тип ошибки как 'unknown'
    if (err instanceof Error) {  // Проверяем, что это экземпляр Error
      console.error('Ошибка регистрации:', err.message);
      res.status(400).json({ status: 'error', message: err.message });
    } else {
      console.error('Неизвестная ошибка:', err);
      res.status(400).json({ status: 'error', message: 'Неизвестная ошибка' });
    }
  }
});

// Роут для авторизации
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await loginUser(email, password);
    res.status(200).json({ status: 'success', message: 'Успешный вход' });
  } catch (err: unknown) {  // Уточняем тип ошибки как 'unknown'
    if (err instanceof Error) {  // Проверяем, что это экземпляр Error
      console.error('Ошибка авторизации:', err.message);
      res.status(400).json({ status: 'error', message: err.message });
    } else {
      console.error('Неизвестная ошибка:', err);
      res.status(400).json({ status: 'error', message: 'Неизвестная ошибка' });
    }
  }
});

// Запуск сервера
app.listen(port, async () => {
  await resetUsersTable();
  console.log(`Сервер запущен на http://localhost:${port}`);
});
