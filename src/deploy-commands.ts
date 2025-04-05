

import { REST, Routes } from "discord.js";
import { config } from "./config";
import { CommandHandler } from "./commands";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands(commands: Map<string, CommandHandler>) {
    const commandsData = Array.from(commands.values()).filter(c => c.data).map((command) => command.data);
    try {
        console.log("❕ Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationCommands(config.DISCORD_CLIENT_ID),
            {
                body: commandsData,
            }
        );

        console.log("✅ Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(`❌ ${error}`);
    }
}
