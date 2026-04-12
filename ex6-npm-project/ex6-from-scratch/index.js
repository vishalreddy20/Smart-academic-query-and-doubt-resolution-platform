import chalk from "chalk";
import {
  add,
  multiply,
  currentDateTime,
  logColor,
  safeDivide,
  fetchSampleTitle,
} from "./NewModule.js";

async function main() {
  try {
    logColor("=== Ex No 6: Custom NPM Project Demo ===");
    console.log(chalk.yellow(`Current Date/Time: ${currentDateTime()}`));

    console.log(chalk.green(`Addition (12 + 8): ${add(12, 8)}`));
    console.log(chalk.green(`Multiplication (6 * 7): ${multiply(6, 7)}`));

    console.log(chalk.blue(`Division (20 / 5): ${safeDivide(20, 5)}`));
    const divideError = safeDivide(20, 0);
    console.log(chalk.red(`Division (20 / 0): ${divideError.error}`));

    const title = await fetchSampleTitle();
    console.log(chalk.magenta(`Fetched TODO title: ${title}`));

    logColor("=== Demo Completed Successfully ===");
  } catch (error) {
    console.log(chalk.red(`Unhandled error: ${error.message}`));
  }
}

main();
