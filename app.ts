import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import type { myClient } from './lib/types/MyClient';
import type { Event } from './lib/types/Event';
import type { Command } from './lib/types/Command';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
}) as myClient;

client.commands = new Collection();
client.cooldowns = new Collection();

const commandTypesFolders = fs.readdirSync(path.join(__dirname, './commands'));

for (const commandTypes of commandTypesFolders) {
	const commandTypesFiles = fs
		.readdirSync(path.join(__dirname, `./commands/${commandTypes}`))
		.filter((file) => file.endsWith('.ts'));

	const importPromises = commandTypesFiles.map((file) => {
		return import(`./commands/${commandTypes}/${file}`);
	});

	const importedCommands = await Promise.all(importPromises);

	const commands: Command[] = importedCommands.map((command) => {
		return command.default;
	});

	for (const command of commands) {
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`Command ${(command as any).data.name} is missing data or execute`
			);
		}
	}
}

const eventFolder = fs.readdirSync(path.join(__dirname, './events'));

const importEventPromises = eventFolder.map((eventfile) => {
	return import(`./events/${eventfile}`);
});

const importedEvents = await Promise.all(importEventPromises);

const events: Event[] = importedEvents.map((event) => {
	return event.default;
});

for (const event of events) {
	if (event.once) {
		client.once(event.name, async (...args: any[]) => {
			event.execute(...args);
		});
	} else {
		client.on(event.name, async (...args: any[]) => {
			event.execute(...args);
		});
	}
}

client.login(process.env.TOKEN);
