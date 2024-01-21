import { Vimbot } from './vimbot';
import { getActions } from './vision';
import readline from 'readline';
import process from 'process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to get objective from the user
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (input) => resolve(input));
  });
}

async function main(): Promise<void> {
  console.log("Initializing the Vimbot driver...");
  const driver = new Vimbot();
  await driver.initialize();  // Ensure Vimbot is fully initialized before proceeding

  console.log("Navigating to Google...");
  await driver.navigate("https://www.google.com");

  let objective: string = "";

  objective = await ask("Please enter your objective: ");

  let prevAction = 'none';

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));  // Wait for 1 second like time.sleep(1) in Python
    console.log("Capturing the screen...");
    const screenshot = await driver.capture();

    console.log("Getting actions for the given objective...");
    let action = await getActions(screenshot, objective, prevAction);

    console.log(`JSON Response: ${JSON.stringify(action)}`);
    prevAction = JSON.stringify(action); // ensuring we have a string representation of the previous action
    console.log('Previous action:', prevAction);

    const done = await driver.performAction(action);  // returns True if done

    if (done) {
      break;
    }
  }

  rl.close(); // Close the readline interface when done
}

// Function to parse command-line arguments and launch the main function
function mainEntry() {
  main().catch(err => {
    console.error('An error occurred:', err);
    process.exit(1);
  });
}

mainEntry(); // Execute the entry function
