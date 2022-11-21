import Discord from 'discord.js';
import chalk from 'chalk';
import { config as DotenvConfig } from 'dotenv';

DotenvConfig()
const client = new Discord.Client({ 
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildBans,
		Discord.GatewayIntentBits.GuildEmojisAndStickers,
		Discord.GatewayIntentBits.GuildIntegrations,
		Discord.GatewayIntentBits.GuildWebhooks,
		Discord.GatewayIntentBits.GuildInvites,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.GuildPresences,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMessageTyping,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildScheduledEvents
  ],
  partials: ["partials/index.ts"],

})

client.on('ready', () => {
	console.log(chalk.green('Logged in as:' + client.user.tag));
});

client.login(process.env.DISCORD_TOKEN)