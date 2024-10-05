import { Events } from 'discord.js';
import type { myClient } from '../lib/types/MyClient.ts';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client: myClient) {
		console.log(`Logged in as ${client.user?.tag}!`);
	},
};
