import { Events, Message } from 'discord.js';
import michi from '../lib/michiInstance.ts';
import { createLog } from '../controllers/dbControllers.ts';

const greetings = [
	"pagi",
	"siang",
	"sore",
	"malam"
]

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.author.bot) return;
			
		if (greetings.some(greeting => message.content.toLowerCase().includes(greeting))) {
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

		const response = await michi.chat(userMessage, message.author.username);

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
