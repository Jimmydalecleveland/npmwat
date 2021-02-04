#!/usr/bin/env node
const { AutoComplete } = require("enquirer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const packageJsonPath = path.resolve("./package.json");
const packageLockPath = path.resolve("./package-lock.json");
const yarnLockPath = path.resolve("./yarn.lock");
const packageJsonExists = fs.existsSync(packageJsonPath);
const yarnLockExists = fs.existsSync(yarnLockPath);

let bufferData;

if (packageJsonExists) {
	bufferData = fs.readFileSync(packageJsonPath);
} else {
	console.error("No package.json in directory. (⊙_⊙)");
	process.exit(1);
}

const packageJson = JSON.parse(bufferData);

if (!packageJson || !packageJson.scripts) {
	console.error("No scripts could be found in package.json file.");
	process.exit(1);
}

// capture the script argument, stripping the actual command off
const regex = /\"(.+):\".+/i;

const execScript = (script) => {
	const scriptName = regex.exec(script)[1];
	const runner = yarnLockExists ? "yarn" : "npm";

	console.log(`Running: ${runner} run ${scriptName}`);
	spawn(runner, ["run", scriptName], { stdio: "inherit" });
};

const prompt = new AutoComplete({
	name: "script",
	message: "Type a script to run",
	choices: Object.entries(packageJson.scripts).map(
		([key, value]) => `"${key}:" "${value}"`
	),
});

prompt.run().then(execScript).catch(console.error);
