import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import type { Command } from './types/Command';

const commandsList: Command[] = [];

const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(path.join(__dirname, `../commands/${folder}`))
		.filter((file) => file.endsWith('.ts'));

	const importPromises = commandFiles.map((file) => {
		return import(`../commands/${folder}/${file}`);
	});

	const importedCommands = await Promise.all(importPromises);

	const commands: Command[] = importedCommands.map((command) => {
		return command.default;
	});

	for (const command of commands) {
		if ('data' in command && 'execute' in command) {
			commandsList.push(command);
		} else {
			console.log(`Command is missing data or execute`);
		}
	}
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

const guildIds = [
	'1063070984409727037',
	'840099499086970910',
	'1015881456763019264',
];

async function loadCommands(guildId: string) {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.APP_ID!, guildId),
			{ body: commandsList.map((command) => command.data) }
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	return 'Successfully loaded commands';
}

(async () => {
	try {
		for (const guildId of guildIds) {
			console.log(await loadCommands(guildId));
		}
	} catch (error) {
		console.error(error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
})();
