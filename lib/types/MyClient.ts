import { Client, Collection } from 'discord.js';

export interface myClient extends Client {
	commands: Collection<string, any>;
	cooldowns: Collection<string, any>;
}
