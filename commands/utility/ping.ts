import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Log } from '../../lib/types/Log';
import michi from '../../lib/michiInstance';

export default {
	cooldown: 5,
	data: new SlashCommandBuilder().setName('meow').setDescription('meow!'),
	execute(interaction: ChatInputCommandInteraction): Log {
		const latency = Date.now() - interaction.createdTimestamp;
		const { foodBar, foodStatus, happinessBar, happinessStatus } =
			michi.getStatus();
		const knownUsers = michi.getKnownUsers();

		const latencyInfo = `Meow! Latency is ${latency}ms`;
		const michiInfo = `food: ${foodBar} | ${foodStatus}, happiness: ${happinessBar} | ${happinessStatus}`;
		const knownUserInfo = `known users: ${knownUsers}`;

		interaction.reply(`${latencyInfo}\n${michiInfo}\n${knownUserInfo}`);

		return {
			userId: interaction.user.id,
			userMessage: 'utility commands',
			botResponse: `${latencyInfo}\n${michiInfo}`,
		};
	},
};
