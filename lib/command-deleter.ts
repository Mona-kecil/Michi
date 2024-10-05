import { REST, Routes } from 'discord.js';
import type { Command } from './types/Command';

const commandsList: Command[] = [];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

export default async function deleteCommands(guildId: string) {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.APP_ID!, guildId),
			{ body: [] }
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	return 'Successfully deleted commands';
}

console.log(await deleteCommands('1063070984409727037'));
