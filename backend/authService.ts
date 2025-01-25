import {
  getUserByEmail,
  insertUser,
  saveCanvasData as saveCanvas,
  updateCanvasData,
  getCanvasById,
  getCanvasesByUserEmail as fetchCanvasesByUserEmail,
  getCanvasElements as getElements,
} from "./db.js";

export const registerUser = async (email: string, password: string) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }
  await insertUser(email, password);
  console.log("Пользователь зарегистрирован");
};

export const loginUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Пользователь не найден");
  }
  if (password !== user.password) {
    throw new Error("Неверный пароль");
  }

  console.log("Вход успешен");
};

export const saveCanvasData = async (
  userEmail: string,
  canvasName: string,
  elementsData: any
) => {
  try {
    const existingCanvas = await getCanvasById(elementsData[0].id);
    if (existingCanvas) {
      await updateCanvasData(userEmail, canvasName, elementsData);
    } else {
      await saveCanvas(userEmail, canvasName, elementsData);
    }
    console.log("Данные сохранены");
  } catch (err) {
    console.error("Ошибка сохранения данных:", err);
    throw new Error("Ошибка сохранения данных");
  }
};

export const getCanvasesByUserEmail = async (userEmail: string) => {
  try {
    const canvases: any = await fetchCanvasesByUserEmail(userEmail);
    return canvases;
  } catch (err) {
    console.error("Ошибка получения канвасов:", err);
    throw new Error("Ошибка получения канвасов");
  }
};

export const getCanvasElements = async (
  userEmail: string,
  canvasName: string
) => {
  try {
    const elements = await getElements(userEmail, canvasName);
    return elements;
  } catch (err) {
    console.error("Ошибка получения элементов канваса:", err);
    throw new Error("Ошибка получения элементов канваса");
  }
};

export { updateCanvasData, getCanvasById };
