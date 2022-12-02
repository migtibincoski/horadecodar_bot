require("dotenv").config();
const Discord = require("discord.js");
const cli_color = require("cli-color");

const oldLogger = console.log;
console.warn = (data) => oldLogger(cli_color.yellow(data));
console.info = (data) => oldLogger(cli_color.blue(data));
console.success = (data) => oldLogger(cli_color.green(data));
console.clear();

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
    Discord.GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: ["partials/index.ts"],
  restRequestTimeout: 99999,
});

client.on("ready", () => {
  console.success("Logged in as: " + client.user.tag);

  const commands = [
    {
      name: "suggestion",
      description: "Give us a suggestion!",
      options: [
        {
          name: "title",
          type: 3,
          description: "Field to enter your suggestion title...",
          required: true,
        },
        {
          name: "content",
          type: 3,
          description: "Field to enter your suggestion...",
          required: true,
        },
      ],
    },
    {
      name: "rules",
      description: "Read our rules!",
    },

    {
      name: "community_role",
      description: "Get your Community Role!",
      // options: [
      //   {
      //     name: "email",
      //     type: 3,
      //     description: "Field to enter your e-mail...",
      //     required: true,
      //   },
      //   {
      //     name: "message",
      //     type: 3,
      //     required: false,
      //     description: "A message to send with your role...",
      //   },
      // ],
    },
  ];

  const rest = new Discord.REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
  );

  (async () => {
    try {
      console.info("Started refreshing application (/) commands.");

      await rest.put(Discord.Routes.applicationCommands(client.user.id), {
        body: commands,
      });

      console.success("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() === true) {
    switch (interaction.commandName) {
      case "suggestion":
        const suggestionMessageObject = await client.channels.cache
          .get(`${process.env.DISCORD_SUGGESTION_CHAT_ID}`)
          .send({
            content: `${Discord.userMention(interaction.user.id)}`,
            embeds: [
              {
                title: "New Suggestion!",
                description: interaction.options.getString("suggestion"),
                color: 0x5109d9,
                author: {
                  name: `${interaction.user.tag} - ${interaction.user.id}`,
                  avatar: `${interaction.user.displayAvatarURL({
                    dynamic: true,
                  })}`,
                  url: `https://discord.com/users/${interaction.user.id}`,
                },
              },
            ],
          });
        suggestionMessageObject.react("✅");
        suggestionMessageObject.react("❌");

        const suggestionThread = await suggestionMessageObject.startThread({
          name: `${interaction.options.getString("title")}`,
          autoArchiveDuration: 60,
          reason: `This thread was created to discuss the ${interaction.user.tag} suggestion.`,
        });
        suggestionThread.send({
          content: `${interaction.user}, this thread was created to discuss your suggestion.`,
        });
        interaction.reply({
          content:
            "Thanks for your suggestion! It has been sent to the server administrators.",
          ephemeral: true,
        });

        break;
      case "rules":
        interaction.reply({
          content: `${Discord.userMention(interaction.user.id)}`,
          ephemeral: true,
          embeds: [
            {
              title: "New suggestion!",
              description:
                "Essas são as regras:\n\n🔴 **Respeite todos os membros;**\n🔴 **É proibido divulgar o conteúdo de outros cursos pagos**, caso você tenha algum bom motivo para isso mande DM para a equipe e avaliaremos;\n🔴 **Evite o flood**, este comportamento atrapalha o ambiente como um todo;\n🔴 **Se você ver algo que pareça errado avise a equipe de moderação**, isso serve para qualquer tipo de comportamento ou compartilhamento de conteúdo;\n🔴 As dúvidas devem ser enviadas no canal de <#1013959821814419567> , não precisa perguntar se alguem entende de alguma linguagem X ou Y, apenas coloque sua dúvida e especifique o máximo possível, adicione prints e detalhes;\n🔴 Utilize os canais off-topic para falar de assuntos não relacionados a programação;\n🔴 **Cuidado ao marcar as pessoas e grupos**, utilize apenas quando necessário, o abuso deste recurso pode resultar em ban.",
              color: 0xff0000,
              url: "https://discord.com/users/" + interaction.user.id,
              author: {
                name: interaction.user.tag + " - ID: " + interaction.user.id,
                url: `https://discord.com/users/${interaction.user.id}`,
                icon_url: `${interaction.user.displayAvatarURL({
                  dynamic: true,
                })}`,
              },
            },
          ],
        });
        break;
      case "community_role":
        // if (
        //   !require("email-validator").validate(
        //     `${interaction.options.getString("email")}`
        //   )
        // ) {
        //   interaction.reply({
        //     content:
        //       "Email inválido. Verifique se está inserido corretamente e tente novamente.",
        //     ephemeral: true,
        //   });
        //   break;
        // }
        // const int = await interaction.reply({
        //   content: `Are you sure you want to receive the Community role? It is only for those who pay for the courses offered by Matheus Battisti!\n\nIf yes, confirm the information provided:\nE-mail: \`${interaction.options.getString(
        //     "email"
        //   )}\`\nDiscord tag (obtained automatically): \`${
        //     interaction.user.tag
        //   }\`\nMessage (optional): ${
        //     interaction.options.getString("message") || "Nothing to report"
        //   }`,
        //   components: [
        //     new Discord.ActionRowBuilder().addComponents(
        //       new Discord.ButtonBuilder()
        //         .setStyle(Discord.ButtonStyle.Primary)
        //         .setLabel("Confirm")
        //         .setCustomId("confirm"),
        //       new Discord.ButtonBuilder()
        //         .setStyle(Discord.ButtonStyle.Danger)
        //         .setLabel("Cancel")
        //         .setCustomId("cancel")
        //     ),
        //   ],
        // });
        // const collector = new Discord.InteractionCollector(client, {
        //   componentType: Discord.ComponentType.Button,
        //   interactionType: Discord.InteractionType.MessageComponent,
        //   time: 15000,
        //   maxUsers: 1,
        // });

        // collector.on("collect", (i) => {
        //   if (i.user.id !== interaction.user.id) {
        //     int.reply({
        //       content: "⚠️ You don't have permission to execute this function!",
        //       ephemeral: true,
        //     });
        //   }
        //   if (i.customId === "confirm") {
        //     client.channels.cache
        //       .get(process.env.DISCORD_COMMUNITY_ROLE_CHAT_ID)
        //       .send({
        //         content: `${Discord.userMention(interaction.user.id)}`,
        //         embeds: [
        //           {
        //             title: "New user from Community!",
        //             description: `
        //       👤 **User:** ${interaction.user}
        //       📨 **E-mail:** ${interaction.options.getString("email")}
        //       📑 **Message:** ${interaction.options.getString("message") || "Nothing to display!"}
        //       `,
        //             color: 0x5109d9,
        //             author: {
        //               name: `${interaction.user.tag} - ${interaction.user.id}`,
        //               avatar: `${interaction.user.displayAvatarURL({
        //                 dynamic: true,
        //               })}`,
        //               url: `https://discord.com/users/${interaction.user.id}`,
        //             },
        //           },
        //         ],
        //       });
        //     int.edit({
        //       content:
        //         Discord.userMention(interaction.user.id) +
        //         "' job requisition has been sent to administrators. Thanks!",
        //     });
        //   } else {
        //     int.delete({
        //       content:
        //         "The job request for " +
        //         Discord.userMention(interaction.user.id) +
        //         " was canceled. To continue, run the command again.",
        //         components: [],
        //         embeds: []
        //     });
        //   }
        // });

        // collector.on("end", (collected) => {
        //   if(collected === 0){
        //     int.edit({ content: "I don't received any confirmation" });
        //   }
        // });

        const roleModal = new Discord.ModalBuilder()
          .setCustomId("community_role_modal")
          .setTitle("Get your Community Role!");

        roleModal.addComponents(
          new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
              .setCustomId("role_modal_email")
              .setLabel("What's your email?")
              .setRequired(true)
              .setStyle(Discord.TextInputStyle.Short)
          ),
          new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
              .setCustomId("role_modal_message")
              .setLabel("Leave a message (optional):")
              .setRequired(false)
              .setStyle(Discord.TextInputStyle.Paragraph)
              .setMaxLength(1024)
          )
        );
        await interaction.showModal(roleModal);

        break;
      default:
        interaction.reply({
          content: "There are no suggestions for this command!",
        });
        break;
    }
  } else if (interaction.isModalSubmit() === true) {
    switch (interaction.commandName) {
      case "community_role_modal":
        client.channels.cache
          .get(process.env.DISCORD_COMMUNITY_ROLE_CHAT_ID)
          .send({
            content: `${Discord.userMention(interaction.user.id)}`,
            embeds: [
              {
                title: "New user from Community!",
                description: `
               👤 **User:** ${interaction.user}
               📨 **E-mail:** ${interaction.fields.getTextInputValue(
                 "role_modal_email"
               )}
               📑 **Message:** ${
                 interaction.fields.getTextInputValue("role_modal_message") ||
                 "Nothing to display!"
               }
               `,
                color: 0x5109d9,
                author: {
                  name: `${interaction.user.tag} - ${interaction.user.id}`,
                  avatar: `${interaction.user.displayAvatarURL({
                    dynamic: true,
                  })}`,
                  url: `https://discord.com/users/${interaction.user.id}`,
                },
              },
            ],
          });
        interaction.reply({
          content:
            Discord.userMention(interaction.user.id) +
            "' job requisition has been sent to administrators. Thanks!",
        });
    }
  }
});

(async () => await client.login(process.env.DISCORD_TOKEN))();
