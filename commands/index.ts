
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";


function getCommands(commandsPath: string) {
    const commands: Map<string, CommandHandler> = new Map();

    const isCompiled = __dirname.endsWith("dist");
    const basePath = !isCompiled
        ? path.join(__dirname, commandsPath)
        : path.join(__dirname, "commands", commandsPath);

    fs.readdirSync(basePath).forEach((file) => {
        if (file.endsWith(".ts") || file.endsWith(".js")) {
            const command = require(`./${isCompiled ? 'commands/' : ''}${commandsPath}/${file}`);
            commands.set(command.name ?? file.replace(".ts", "").replace(".js", ""), command);
        }
    });
    return commands;
}

export function getAllCommands() {
    return new Map([...getCommands("text"), ...getCommands("context-menu")]);
}


export interface CommandHandler {
    name: string;
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>
}