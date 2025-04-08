import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, GuildMemberRoleManager, MessageActionRowComponent, MessageActionRowComponentBuilder, MessageActionRowComponentData, MessageContextMenuCommandInteraction, MessageFlags, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, UserContextMenuCommandInteraction } from "discord.js";
import { AuctionCard } from "../../models/AuctionCard";
import { FullExtractedCard, getCardFromEmbed, getCardFromMessage, SimpleExtractedCard } from "../../helpers/sofiMessages.helper";
import { config } from "../../config";
import { SofiEvent } from "../../models/SofiEvent";
import { ERRORS } from "../../helpers/errorMessages.constants";
import { customId } from "../../interactions/select-menu/submitAuctionCardWithPings";
import { UsersStats } from "../../models/UserStats";

export const name = "Add Card to Auction (Pinged)";

export const data = new ContextMenuCommandBuilder()
    .setName(name)
    .setType(ApplicationCommandType.Message);

export async function execute(interaction: CommandInteraction) {
    const contextInteraction = interaction as MessageContextMenuCommandInteraction;
    if (contextInteraction.targetMessage.author.bot !== true) return;

    try {
        let extractedCard: SimpleExtractedCard = getCardFromMessage(contextInteraction.targetMessage.content);

        // Check if event already exists
        const eventExists = await SofiEvent.exists({ eventName: extractedCard.eventName });
        if (!eventExists) {
            return interaction.reply({
                content: ERRORS.EVENT_DOESNT_EXIST,
                flags: MessageFlags.Ephemeral
            });

        }

        // Check if card already exists
        const cardExists = await AuctionCard.exists({ cardCode: extractedCard.code });
        if (cardExists) {
            return interaction.reply({
                content: ERRORS.CARD_ALREADY_EXISTS,
                flags: MessageFlags.Ephemeral
            });
        }


        let users = await UsersStats.find();
        if (users.length === 0) {
            UsersStats.insertOne({ username: interaction.user.username, discordId: interaction.user.id });

            users = await UsersStats.find();
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder("Select who was pinged!")
            .setMinValues(1)
            .setMaxValues(users.length);

        select
            .addOptions(
                ...users.map(u => new StringSelectMenuOptionBuilder().setLabel(u.username).setValue(u.discordId)),
            );


        const firstRow = new ActionRowBuilder().addComponents(select);

        return await contextInteraction.reply({
            components: [firstRow as any],
            flags: MessageFlags.Ephemeral
        });

    }
    catch (ex) {
        console.error(ex);
    }
}
