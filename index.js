require("dotenv").config();
const Discord = require("discord.js");
const cli_color = require("cli-color");
const express = require("express")();

const debuggerWebhook = new Discord.WebhookClient({
  url: `${process.env.DISCORD_DEBUG_WEBHOOK_URL}`,
});
const oldLogger = console.log;
console.warn = (data) => oldLogger(cli_color.yellow(data));
console.info = (data) => oldLogger(cli_color.blue(data));
console.success = (data) => oldLogger(cli_color.green(data));
console.clear();

debuggerWebhook.send({
  content: `\`\`\`${
    process.env.IS_DEV_WORKSPACE === "true" ? "Development" : "Stable"
  } bot starting...\`\`\``,
});

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

client.on("debug", (data) => {
  if (
    data.includes("Sending a heartbeat.") ||
    data.includes("Heartbeat acknowledged") ||
    data.includes("Provided token")
  )
    return;
  debuggerWebhook.send({
    content: data,
  });
});

process.on("unhandledRejection", (error) => {
  debuggerWebhook.send({
    content: `\`\`\`Diff\n- ${error}\`\`\``,
  });
});

client.on("ready", () => {
  console.success("Logged in as: " + client.user.tag);

  const commands = [
    {
      name: "suggestion",
      description: "Give us a suggestion!",
    },
    {
      name: "rules",
      description: "Read our rules!",
    },

    {
      name: "community_role",
      description: "Get your Community Role!",
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
    if (interaction.commandName === "suggestion") {
      const roleModal = new Discord.ModalBuilder()
        .setCustomId("suggestion_modal")
        .setTitle("Send us a suggestion!");

      roleModal.addComponents(
        new Discord.ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
            .setCustomId("suggestion_modal_title")
            .setLabel("Create a title for your suggestion:")
            .setRequired(true)
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(100)
        ),
        new Discord.ActionRowBuilder().addComponents(
          new Discord.TextInputBuilder()
            .setCustomId("suggestion_modal_description")
            .setLabel("Describe your suggestion:")
            .setRequired(true)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setMaxLength(1024)
        )
      );
      await interaction.showModal(roleModal);
    } else if (interaction.commandName === "rules") {
      interaction.reply({
        content: `${Discord.userMention(interaction.user.id)}`,
        ephemeral: true,
        embeds: [
          {
            title: "Community Rules!",
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
    } else if (interaction.commandName === "community_role") {
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
    } else {
      interaction.reply({
        content: "There are no suggestions for this command!",
      });
    }
  } else if (interaction.isModalSubmit() === true) {
    if (interaction.customId === "community_role_modal") {
      if (
        new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/).test(
          interaction.fields.getTextInputValue("role_modal_email")
        ) === false
      ) {
        return interaction.reply({
          content:
            "The email you provided is invalid. Check that you wrote it correctly and try again.",
          ephemeral: true,
        });
      }
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
    } else if (interaction.customId === "suggestion_modal") {
      const suggestionMessageObject = await client.channels.cache
        .get(`${process.env.DISCORD_SUGGESTION_CHAT_ID}`)
        .send({
          content: `${Discord.userMention(interaction.user.id)}`,
          embeds: [
            {
              title: `${interaction.fields.getTextInputValue(
                "suggestion_modal_title"
              )}`,
              description: `${interaction.fields.getTextInputValue(
                "suggestion_modal_description"
              )}`,
              author: {
                name: "New Suggestion!",
                icon_url: "https://cdn-icons-png.flaticon.com/512/32/32339.png",
              },
              footer: {
                text:
                  "This suggestion was submitted by " +
                  interaction.user.tag +
                  ".",
                icon_url: `${interaction.user.displayAvatarURL({
                  dynamic: true,
                  size: 1024,
                })}`,
              },
            },
          ],
        });
      suggestionMessageObject.react("✅");
      suggestionMessageObject.react("❌");

      const suggestionThread = await suggestionMessageObject.startThread({
        name: `${interaction.fields.getTextInputValue(
          "suggestion_modal_title"
        )}`,
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
    }
  }
});

client.login(`${process.env.DISCORD_TOKEN}`);

// Simple Web Server
express.get("/", (req, res) => {
  res.send("Hello World!");
});
express.post("/", (req, res) => {
  res.json({
    hello: "world!",
  });
});
express.listen(8000);
