import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

export const openDb = (): sqlite3.Database => {
  return new sqlite3.Database(
    "./my_database.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
      } else {
        console.log("База данных подключена");
      }
    }
  );
};

export const resetUsersTable = async () => {
  const db = openDb();
  const dropQuery = "DROP TABLE IF EXISTS users";
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
    console.log("Старая таблица users удалена (если она существовала)");

    await new Promise<void>((resolve, reject) => {
      db.run(createQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Новая таблица users создана");
  } catch (err) {
    console.error("Ошибка при работе с таблицей:", err);
  } finally {
    db.close();
  }
};

export const getUserByEmail = async (email: string): Promise<any | null> => {
  const db = openDb();
  const query = "SELECT * FROM users WHERE email = ?";
  return new Promise((resolve, reject) => {
    db.get(query, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const insertUser = async (email: string, password: string) => {
  try {
    const db = openDb();
    const hashedPassword = await bcrypt.hash(password, 10);
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
    console.log("Пользователь добавлен");
  } catch (err) {
    console.error(
      "Ошибка хэширования пароля или добавления пользователя:",
      err
    );
    throw err;
  }
};
