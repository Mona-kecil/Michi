import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export interface Command {
	cooldown: number;
	data: SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => any;
}
