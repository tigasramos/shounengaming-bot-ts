// import { ActionRowBuilder, CommandInteraction, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

// export const data = new SlashCommandBuilder()
//     .setName("ping")
//     .setDescription("Replies with Pong!");

// export async function execute(interaction: CommandInteraction) {
//     const modal = new ModalBuilder()
//         .setCustomId('myModal')
//         .setTitle('My Modal');

//     // Add components to modal

//     // Create the text input components
//     const favoriteColorInput = new TextInputBuilder()
//         .setCustomId('favoriteColorInput')
//         // The label is the prompt the user sees for this input
//         .setLabel("What's your favorite color?")
//         // Short means only a single line of text
//         .setStyle(TextInputStyle.Short);

//     const hobbiesInput = new TextInputBuilder()
//         .setCustomId('hobbiesInput')
//         .setLabel("What's some of your favorite hobbies?")
//         // Paragraph means multiple lines of text.
//         .setStyle(TextInputStyle.Paragraph);

//     const select = new StringSelectMenuBuilder()
//         .setCustomId('teste')
//         .setPlaceholder("Make a selection!")
//         .setMinValues(1)
//         .setMaxValues(2);

//     select
//         .addOptions(
//             new StringSelectMenuOptionBuilder()
//                 .setLabel("Yukino | p2e4w2 | PlayerEnergy")
//                 .setValue("p2e4w2"),
//             new StringSelectMenuOptionBuilder()
//                 .setLabel("Marin | p3tr32 | Tien The Goat")
//                 .setValue("p3tr32")
//         );
//     // An action row only holds one text input,
//     // so you need one action row per text input.
//     const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
//     const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);
//     const thirdActionRow = new ActionRowBuilder().addComponents(select);

//     // Add inputs to the modal
//     modal.addComponents(firstActionRow as any, secondActionRow, thirdActionRow);

//     // Show the modal to the user
//     await interaction.showModal(modal);
// }
