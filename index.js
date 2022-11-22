require("dotenv").config();
const Discord = require("discord.js");
const cli_color = require("cli-color");

const oldLogger = console.log;
console.warn = (data) => oldLogger(cli_color.yellow(data));
console.info = (data) => oldLogger(cli_color.blue(data));
console.success = (data) => oldLogger(cli_color.green(data));

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
	console.success('Logged in as:' + client.user.tag);

		const commands = [
      {
		    name: 'suggestion',
		    description: 'Give us a suggestion!',
				options: [
					{     
		         name: 'suggestion',
		         type: 3,
		         description: 'Field to enter your suggestion...',
		         required: true
		      }
		    ]
		  },
			{
		    name: 'rules',
		    description: 'Read our rules!',
		  },
			
			{
		    name: 'community_role',
		    description: 'Get your Community Role!',
				options: [{
					name: 'email',
					type: 3,
					description: 'Field to enter your e-mail...',
					required: true
				}, {
					name: 'message',
					type: 3,
					required: false,
					description: 'A message to send with your role...'
				}]
		  }
		];

	const rest = new Discord.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
	
	(async () => {
	  try {
	    console.info('Started refreshing application (/) commands.');
	
	    await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: commands });
	
	    console.success('Successfully reloaded application (/) commands.');
	  } catch (error) {
	    console.error(error);
	  }
	})()
});

client.on('interactionCreate', async (interaction) => {
	if(interaction.isChatInputCommand() !== true) return;

	switch (interaction.commandName){
		case "suggestion":
			client.channels.cache.get(`${process.env.DISCORD_SUGGESTION_CHAT_ID}`).send({
				content: `${Discord.userMention(interaction.user.id)}`,
				embeds: [{
					title: 'New Suggestion!',
					description: interaction.options.getString('suggestion'),
					color: 0x5109d9,
					author: {
						name: `${interaction.user.tag} - ${interaction.user.id}`,
						avatar: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
						url: `https://discord.com/users/${interaction.user.id}`
					},
				}
			]
			})
	    interaction.reply({
	      content: 'Thanks for your suggestion! It has been sent to the server administrators.',
	      ephemeral: true
			})

			break;
		case "rules":
			interaction.reply({
	      content: `${Discord.userMention(interaction.user.id)}`,			
	      ephemeral: true, 
				embeds: [{
	            title: "New suggestion!",
	            description: "Essas são as regras:\n\n🔴 **Respeite todos os membros;**\n🔴 **É proibido divulgar o conteúdo de outros cursos pagos**, caso você tenha algum bom motivo para isso mande DM para a equipe e avaliaremos;\n🔴 **Evite o flood**, este comportamento atrapalha o ambiente como um todo;\n🔴 **Se você ver algo que pareça errado avise a equipe de moderação**, isso serve para qualquer tipo de comportamento ou compartilhamento de conteúdo;\n🔴 As dúvidas devem ser enviadas no canal de <#1013959821814419567> , não precisa perguntar se alguem entende de alguma linguagem X ou Y, apenas coloque sua dúvida e especifique o máximo possível, adicione prints e detalhes;\n🔴 Utilize os canais off-topic para falar de assuntos não relacionados a programação;\n🔴 **Cuidado ao marcar as pessoas e grupos**, utilize apenas quando necessário, o abuso deste recurso pode resultar em ban.",
	            color: 0xff0000,
	            url: "https://discord.com/users/" + interaction.user.id,
	            author: {
	                name: interaction.user.tag + " - ID: " + interaction.user.id,
	                url: `https://discord.com/users/${interaction.user.id}`,
	                icon_url: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
							}
				}]
			})
			break;
		case "community_role": 
			interaction.reply({ content: `Are you sure you want to receive the Community role? It is only for those who pay for the courses offered by Matheus Battisti!\n\nIf yes, confirm the information provided:\nE-mail: ${interaction.options.getString("email")}\nDiscord tag (obtained automatically): ${interaction.user.tag}\nMessage (optional): ${interaction.options.getString("message") || "Nothing to report"}` })
			break;
		default: 
			interaction.reply({ content: "Não há sugestões para este comando." })
			break;
	}
});

client.login(process.env.DISCORD_TOKEN)