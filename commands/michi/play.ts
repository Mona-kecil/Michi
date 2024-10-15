import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import michi from '../../lib/michiInstance';
import Activity from '../../lib/classes/Activity';
import type { Log } from '../../lib/types/Log';

const activityList: Activity[] = [
	new Activity('Bola', 40),
	new Activity('Tongkat Pancing', 50),
	new Activity('Catnip', 80),
	new Activity('Lampu Laser', 60),
	new Activity('Cat Tree', 50),
];

export default {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Main michi!')
		.addStringOption((option) =>
			option
				.setName('activity')
				.setDescription('Activity')
				.setRequired(true)
				.addChoices(
					{ name: 'Bola', value: 'Bola' },
					{ name: 'Tongkat Pancing', value: 'Tongkat Pancing' },
					{ name: 'Catnip', value: 'Catnip' },
					{ name: 'Lampu Laser', value: 'Lampu Laser' },
					{ name: 'Cat Tree', value: 'Cat Tree' }
				)
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<Log> {
		const activity = activityList.find(
			(activity) => activity.name === interaction.options.getString('activity')
		);

		if (!activity) {
			await interaction.reply('Yaaahh, mainannya lagi gaada nih..');
			return {
				userId: interaction.user.id,
				userMessage: 'Main michi!',
				botResponse: `Yaaahh, mainannya lagi gaada nih..`,
			};
		}

		interaction.deferReply();
		const response = await michi.play(activity, interaction.user.username);
		interaction.editReply(response!);

		return {
			userId: interaction.user.id,
			userMessage: 'Main michi!',
			botResponse: response!,
		};
	},
};
