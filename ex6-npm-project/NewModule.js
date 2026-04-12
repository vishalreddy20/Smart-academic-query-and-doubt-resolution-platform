import chalk from "chalk";
import moment from "moment";
import axios from "axios";

export const add = (a, b) => {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("add(a, b) requires number inputs");
  }
  return a + b;
};

export const multiply = (a, b) => {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("multiply(a, b) requires number inputs");
  }
  return a * b;
};

export const getCurrentDateTime = () => moment().format("YYYY-MM-DD HH:mm:ss");

export const printInfo = (message) => {
  console.log(chalk.cyanBright(message));
};

export const fetchSampleTodo = async () => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/todos/1", { timeout: 5000 });
    return response.data;
  } catch (error) {
    return { error: `API error: ${error.message}` };
  }
};

export const safeDivide = (a, b) => {
  try {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    return a / b;
  } catch (error) {
    return { error: error.message };
  }
};
