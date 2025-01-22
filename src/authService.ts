import bcrypt from "bcrypt";
import { getUserByEmail, insertUser } from "./db.js";

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

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Неверный пароль");
  }

  console.log("Вход успешен");
};
