import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { getAllCommands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { connectDB } from "./config/db";
import { getSelectMenus } from "./interactions";
import { onMessageReceived } from "./events/messageCreate";

//------------------------------------
const commands = getAllCommands();
const selectMenus = getSelectMenus();
// const modals = getModals();
// const buttons = getButtons();
//------------------------------------

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
});

client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user?.tag} 🤖`);

    await connectDB();

    await deployCommands(commands);
});


client.on(Events.MessageCreate, onMessageReceived);
client.on(Events.InteractionCreate, async (interaction) => {
    // if (interaction.isButton()) {
    //     const { customId } = interaction;
    //     if (buttons.has(customId)) {
    //         buttons.get(customId)?.execute(interaction);
    //     }
    // }

    // // Modal
    // if (interaction.isModalSubmit()) {
    //     const { customId } = interaction;
    //     if (modals.has(customId)) {
    //         modals.get(customId)?.execute(interaction);
    //     }
    // }

    // Select Menus
    if (interaction.isStringSelectMenu()) {
        const { customId } = interaction;
        if (selectMenus.has(customId)) {
            selectMenus.get(customId)?.execute(interaction);
        }
    }

    // Commands and Context Menus
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        if (commands.has(commandName)) {
            commands.get(commandName)?.execute(interaction);
        }
    }


});

client.login(config.DISCORD_TOKEN).catch(console.error);;
