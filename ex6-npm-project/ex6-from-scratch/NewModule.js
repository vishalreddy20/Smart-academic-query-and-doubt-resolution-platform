import chalk from "chalk";
import moment from "moment";
import axios from "axios";

export function add(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("add requires numeric inputs");
  }
  return a + b;
}

export function multiply(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("multiply requires numeric inputs");
  }
  return a * b;
}

export function currentDateTime() {
  return moment().format("YYYY-MM-DD HH:mm:ss");
}

export function logColor(message) {
  console.log(chalk.cyan(message));
}

export function safeDivide(a, b) {
  try {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    return a / b;
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchSampleTitle() {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/todos/1", {
      timeout: 5000,
    });
    return response.data.title;
  } catch (error) {
    return `API error: ${error.message}`;
  }
}
