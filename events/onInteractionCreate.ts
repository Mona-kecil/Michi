import { Events, Collection, ChatInputCommandInteraction } from 'discord.js';
import type { myClient } from '../lib/types/MyClient.ts';
import type { Command } from '../lib/types/Command.ts';
import { createLog } from '../controllers/dbControllers.ts';

export default {
	name: Events.InteractionCreate,
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.isChatInputCommand()) return;

		const client = interaction.client as myClient;
		const command: Command = client.commands.get(interaction.commandName);

		if (!command) return;

		const { cooldowns } = client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime =
				timestamps.get(interaction.user.id)! + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({
					content: `Please wait ${timeLeft.toFixed(
						1
					)} more second(s) before reusing the \`${
						command.data.name
					}\` command.`,
					ephemeral: true,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		try {
			const { userId, userMessage, botResponse } = await command.execute(
				interaction
			);

			console.log(await createLog(userId, userMessage, botResponse));
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		}
	},
};
