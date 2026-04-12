import chalk from "chalk";
import {
  add,
  multiply,
  getCurrentDateTime,
  printInfo,
  fetchSampleTodo,
  safeDivide,
} from "./NewModule.js";

const run = async () => {
  try {
    printInfo("=== Ex No 6: Custom NPM Project Demo ===");
    console.log(chalk.yellow(`Current Date/Time: ${getCurrentDateTime()}`));

    const sum = add(10, 15);
    const product = multiply(6, 7);
    console.log(chalk.green(`Addition (10 + 15): ${sum}`));
    console.log(chalk.green(`Multiplication (6 * 7): ${product}`));

    const divisionOk = safeDivide(20, 5);
    const divisionErr = safeDivide(20, 0);
    console.log(chalk.blue(`Division (20 / 5): ${divisionOk}`));
    console.log(chalk.red(`Division (20 / 0): ${divisionErr.error}`));

    const todo = await fetchSampleTodo();
    if (todo.error) {
      console.log(chalk.red(todo.error));
    } else {
      console.log(chalk.magenta(`Fetched TODO title: ${todo.title}`));
    }

    printInfo("=== Demo Completed Successfully ===");
  } catch (error) {
    console.log(chalk.red(`Unhandled error: ${error.message}`));
  }
};

run();
