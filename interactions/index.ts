import { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import fs from "fs";
import path from "path";


function getInteractions<T>(interactionPath: string) {
    const interactions: Map<string, InteractionHandler<T>> = new Map();
    const isCompiled = __dirname.endsWith("dist");

    const basePath = isCompiled
        ? path.join(__dirname, interactionPath)
        : path.join(__dirname, "interactions", interactionPath);
    fs.readdirSync(basePath).forEach((file) => {
        if (file.endsWith(".ts") || file.endsWith(".js")) {
            const interaction = require(`./${interactionPath}/${file}`);
            interactions.set(interaction.customId, interaction);
        }
    });
    return interactions;
}

// // Buttons
// export function getButtons() {
//     return getInteractions<ButtonInteraction>("button");
// }

// Select Menus
export function getSelectMenus() {
    return getInteractions<AnySelectMenuInteraction>("select-menu");
}

// // Modals
// export function getModals() {
//     return getInteractions<ModalSubmitInteraction>("modal");
// }

export interface InteractionHandler<T> {
    customId: string;
    execute: (interaction: T) => Promise<void>
}