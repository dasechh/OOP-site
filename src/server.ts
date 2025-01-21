import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const port = 3000;

// Включаем CORS до роутов
app.use(cors({
  origin: '*', // Разрешаем только с клиента на этом порту
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const openDb = (): sqlite3.Database => {
  return new sqlite3.Database('./my_database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Ошибка подключения к базе данных:', err.message);
    } else {
      console.log('База данных подключена');
    }
  });
};

const resetUsersTable = async () => {
  const db = openDb();
  const dropQuery = 'DROP TABLE IF EXISTS users';
  const createQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;

  try {
    await new Promise<void>((resolve, reject) => {
      db.run(dropQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Старая таблица users удалена (если она существовала)');
    
    await new Promise<void>((resolve, reject) => {
      db.run(createQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Новая таблица users создана');
  } catch (err) {
    console.error('Ошибка при работе с таблицей:', err);
  } finally {
    db.close();
  }
};

const insertUser = async (email: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = openDb();
    const query = `
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `;
    await new Promise<void>((resolve, reject) => {
      db.run(query, [email, hashedPassword], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Пользователь добавлен');
  } catch (err) {
    console.error('Ошибка хэширования пароля или добавления пользователя:', err);
    throw err; // Пробрасываем ошибку для дальнейшей обработки
  }
};

const getUserByEmail = async (email: string): Promise<any | null> => {
  const db = openDb();
  const query = 'SELECT * FROM users WHERE email = ?';
  return new Promise((resolve, reject) => {
    db.get(query, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

app.post('/register', async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('Пользователь с таким email уже существует');
      return res.status(400).json({ status: 'error', message: 'Пользователь с таким email уже существует' });
    }

    await insertUser(email, password);
    console.log('Пользователь зарегистрирован');
    res.status(200).json({ status: 'success', message: 'Пользователь зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ status: 'error', message: 'Ошибка регистрации' });
  }
});

app.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  getUserByEmail(email)
    .then((user) => {
      if (!user) {
        console.log('Пользователь не найден');
        return res.status(400).json({ status: 'error', message: 'Пользователь не найден' });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Ошибка при сравнении паролей:', err);
          return res.status(500).json({ status: 'error', message: 'Ошибка сервера' });
        }
        if (!isMatch) {
          console.log('Неверный пароль');
          return res.status(400).json({ status: 'error', message: 'Неверный пароль' });
        }
        console.log('Вход успешен');
        res.status(200).json({ status: 'success', message: 'Успешный вход' });
      });
    })
    .catch((err) => {
      console.error('Ошибка при поиске пользователя:', err);
      res.status(500).json({ status: 'error', message: 'Ошибка сервера' });
    });
});

app.listen(port, async () => {
  await resetUsersTable();
  console.log(`Сервер запущен на http://localhost:${port}`);
});
