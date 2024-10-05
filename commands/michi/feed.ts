import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import michi from '../../lib/michiInstance';
import Food from '../../lib/classes/Food';
import type { Log } from '../../lib/types/Log';

const foodList: Food[] = [
	new Food('Tuna', 30),
	new Food('Chicken', 25),
	new Food('Salmon', 30),
	new Food('Telur Rebus', 20),
	new Food('Royal Canin', 25),
	new Food('Snack', 5),
];

export default {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('feed')
		.setDescription('Kasih makan michi!')
		.addStringOption((option) =>
			option
				.setName('food')
				.setDescription('Food')
				.setRequired(true)
				.addChoices(
					{ name: 'Tuna', value: 'Tuna' },
					{ name: 'Chicken', value: 'Chicken' },
					{ name: 'Salmon', value: 'Salmon' },
					{ name: 'Telur rebus', value: 'Telur Rebus' },
					{ name: 'Royal Canin', value: 'Royal Canin' },
					{ name: 'Snack', value: 'Snack' }
				)
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<Log> {
		const food = foodList.find(
			(food) => food.name === interaction.options.getString('food')
		);

		if (!food) {
			await interaction.reply('Yaaahh, makanannya abis nih..');
			return {
				userId: interaction.user.id,
				userMessage: 'Kasih makan michi!',
				botResponse: `Yaaahh, makanannya lagi abis nih..`,
			};
		}

		interaction.deferReply();
		const response = await michi.feed(food, interaction.user.username);
		interaction.editReply(response!);

		return {
			userId: interaction.user.id,
			userMessage: 'Kasih makan michi!',
			botResponse: response!,
		};
	},
};
