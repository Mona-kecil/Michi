import { Events, Message } from 'discord.js';
import michi from '../lib/michiInstance.ts';
import { createLog } from '../controllers/dbControllers.ts';

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.author.bot) return;

		if (message.content.includes('pagi')) {
			const response = await michi.chatPagi(
				message.content,
				message.author.username
			);
			await message.reply(response!);
			console.log(
				await createLog(message.author.id, message.content, response!)
			);
		}

		if (!message.mentions.users.has(message.client.user.id)) return;

		const [mention, ...chat] = message.content.split(' ');
		const userMessage = chat.join(' ');

		const response = await michi.chat(userMessage, mention);

		if (response.refusal) {
			await message.reply('Gaboleh ngomong gitu sama michii');
			console.log(
				await createLog(message.author.id, userMessage, response.refusal)
			);
		} else {
			await message.reply(response.content!);
			console.log(
				await createLog(message.author.id, userMessage, response.content!)
			);
		}
	},
};
