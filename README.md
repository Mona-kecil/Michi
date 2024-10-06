# Michi - Your Digital Pet on Discord

Michi is a Discord bot that simulates the experience of having a digital pet!
Created as a part of a learning project, Michi integrates conversational interactions powered by OpenAI's GPT-4o-mini.

The main goal of Michi is to create an interactive and engaging experience on Discord where users can interact with Michi as if they have their very own cute digital pet. Michi responds with enthusiasm and listens to users, just like a real pet would.

## Tech used
- TypeScript: JS without the surprise runtime errors.
- Discord.js: Discord API wrapper
- Bun: Fastest JavaScript runtime
- Supabase: supa good database
- Prisma: ORM for type-safe database interactions
- OpenAI GPT-4o-mini: AI model for generating responses

## Setup
How to setup Michi locally
1. Clone the repo
```bash
git clone https://github.com/Mona-kecil/Michi.git
cd Michi
```

2. Install dependencies
```bash
bun install
```

3. Create a `.env` file in the root directory and add the following variables:
```bash
TOKEN=your-discord-bot-token
APP_ID=your-discord-app-id
OPENAI_API=your-openai-api-key
DATABASE_URL=your-supabase-database-url
DIRECT_URL=your-supabase-direct-url
```

4. Push the database schema to Supabase
```bash
bunx prisma db push
```

5. Run the bot
```bash
bun run dev
```
6. Replace the `guildIds` array with your guild IDs in `command-loader.ts` and `command-deleter.ts` (sorry it's a bit manual). And then run the following command
```bash
bun run reload_commands
```

## Usage
Once the bot is running, you can interact with Michi using:
- Mention: Mention michi in the chat and it will respond to you
- Slash commands: Use the slash commands to feed, play, or get michi's information

## Contact
If you have any questions or just want to chat, feel free to reach out via:
- Discord: monakecil
- Twitter: @2045humanoid