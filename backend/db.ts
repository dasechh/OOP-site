import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";

export const openDb = (): sqlite3.Database => {
  return new sqlite3.Database(
    "backend/database.db",
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

export const makeUsersTable = async () => {
  const db = openDb();
  const createUsersQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;

  const createElementsQuery = `
    CREATE TABLE IF NOT EXISTS elements (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      canvas_name TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      styles TEXT NOT NULL,
      inner_html TEXT NOT NULL,
      base64_image TEXT,
      data_content TEXT,
      FOREIGN KEY (user_email) REFERENCES users(email)
    )
  `;

  try {
    await new Promise<void>((resolve, reject) => {
      db.run(createUsersQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Таблица users создана (если она не существовала)");

    await new Promise<void>((resolve, reject) => {
      db.run(createElementsQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Таблица elements создана (если она не существовала)");
  } catch (err) {
    console.error("Ошибка при работе с таблицами:", err);
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
    const query = "INSERT INTO users (email, password) VALUES (?, ?)";
    await new Promise<void>((resolve, reject) => {
      db.run(query, [email, password], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Пользователь добавлен");

    await copyTemplateDesign(email);
  } catch (err) {
    console.error("Ошибка при добавлении пользователя:", err);
  }
};

const copyTemplateDesign = async (newUserEmail: string) => {
  const db = openDb();
  const templateUserEmail = "abob2a@mail.ru";
  const templateCanvasName = "Тестовый дизайн 1";

  try {
    const elements = await new Promise<any[]>((resolve, reject) => {
      db.all(
        "SELECT * FROM elements WHERE user_email = ? AND canvas_name = ?",
        [templateUserEmail, templateCanvasName],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    for (const element of elements) {
      let newId = uuidv4();
      if (element.id.startsWith("user-")) {
        newId = `user-${uuidv4()}`;
      } else if (element.id.startsWith("qr-")) {
        newId = `qr-${uuidv4()}`;
      } else if (element.id.startsWith("image-")) {
        newId = `image-${uuidv4()}`;
      } else if (element.id.startsWith("text-")) {
        newId = `text-${uuidv4()}`;
      }

      const query = `
        INSERT INTO elements (id, user_email, canvas_name, tag_name, styles, inner_html, base64_image, data_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await new Promise<void>((resolve, reject) => {
        db.run(
          query,
          [
            newId,
            newUserEmail,
            element.canvas_name,
            element.tag_name,
            element.styles,
            element.inner_html,
            element.base64_image,
            element.data_content,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log(`Шаблонный дизайн скопирован для пользователя ${newUserEmail}`);
  } catch (err) {
    console.error("Ошибка при копировании шаблонного дизайна:", err);
  } finally {
    db.close();
  }
};

export const saveCanvasData = async (
  userEmail: string,
  canvasName: string,
  elementsData: any
) => {
  const db = openDb();
  try {
    const templateExists = await new Promise<boolean>((resolve, reject) => {
      db.get(
        "SELECT 1 FROM elements WHERE user_email = ? AND canvas_name = ? LIMIT 1",
        [userEmail, "Тестовый дизайн 1"],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!templateExists) {
      await copyTemplateDesign(userEmail);
    }

    for (const element of elementsData) {
      const query = `
        INSERT INTO elements (id, user_email, canvas_name, tag_name, styles, inner_html, base64_image, data_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_email = excluded.user_email,
          canvas_name = excluded.canvas_name,
          tag_name = excluded.tag_name,
          styles = excluded.styles,
          inner_html = excluded.inner_html,
          base64_image = excluded.base64_image,
          data_content = excluded.data_content
      `;
      await new Promise<void>((resolve, reject) => {
        db.run(
          query,
          [
            element.id || uuidv4(),
            userEmail,
            canvasName,
            element.tagName,
            element.styles,
            element.innerHTML,
            element.base64Image,
            element.dataContent,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log("Данные элементов сохранены");
  } catch (err) {
    console.error("Ошибка при сохранении данных элементов:", err);
  } finally {
    db.close();
  }
};

export const getCanvasById = async (id: string): Promise<any | null> => {
  const db = openDb();
  const query = "SELECT * FROM elements WHERE id = ?";
  return new Promise((resolve, reject) => {
    db.get(query, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const updateCanvasData = async (
  userEmail: string,
  canvasName: string,
  elementsData: any
) => {
  const db = openDb();
  try {
    // Сначала обновляем или добавляем данные элементов
    for (const element of elementsData) {
      const query = `
        INSERT OR REPLACE INTO elements (id, user_email, canvas_name, tag_name, styles, inner_html, base64_image, data_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await new Promise<void>((resolve, reject) => {
        db.run(
          query,
          [
            element.id,
            userEmail,
            canvasName,
            element.tagName,
            element.styles,
            element.innerHTML,
            element.base64Image,
            element.dataContent
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log("Данные элементов обновлены или добавлены");

    // После сохранения проверяем наличие шаблона
    const templateExists = await new Promise<boolean>((resolve, reject) => {
      db.get(
        "SELECT 1 FROM elements WHERE user_email = ? AND canvas_name = ? LIMIT 1",
        [userEmail, "Тестовый дизайн 1"],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    // Если шаблон не существует, копируем его
    if (!templateExists) {
      await copyTemplateDesign(userEmail);
    }
  } catch (err) {
    console.error("Ошибка при обновлении или добавлении данных элементов:", err);
  } finally {
    db.close();
  }
};

export const getCanvasesByUserEmail = async (
  userEmail: string
): Promise<any[]> => {
  const db = openDb();
  const query =
    "SELECT DISTINCT canvas_name FROM elements WHERE user_email = ?";
  return new Promise((resolve, reject) => {
    db.all(query, [userEmail], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getCanvasElements = async (
  userEmail: string,
  canvasName: string
): Promise<any[]> => {
  const db = openDb();
  const query =
    "SELECT * FROM elements WHERE user_email = ? AND canvas_name = ?";
  return new Promise((resolve, reject) => {
    db.all(query, [userEmail, canvasName], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
