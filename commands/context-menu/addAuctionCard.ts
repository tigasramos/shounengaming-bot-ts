import { ApplicationCommandType, ButtonBuilder, ButtonStyle, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, GuildMemberRoleManager, MessageActionRowComponent, MessageActionRowComponentBuilder, MessageActionRowComponentData, MessageContextMenuCommandInteraction, MessageFlags, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, UserContextMenuCommandInteraction } from "discord.js";
import { AuctionCard } from "../../models/AuctionCard";
import { FullExtractedCard, getCardFromEmbed, getCardFromMessage, logAuctionCardMessage, SimpleExtractedCard } from "../../helpers/sofiMessages.helper";
import { config } from "../../config";
import { SofiEvent } from "../../models/SofiEvent";
import { ERRORS } from "../../helpers/errorMessages.constants";

export const name = "Add Card to Auction";

export const data = new ContextMenuCommandBuilder()
    .setName(name)
    .setType(ApplicationCommandType.Message);

export async function execute(interaction: CommandInteraction) {
    const contextInteraction = interaction as MessageContextMenuCommandInteraction;
    if (contextInteraction.targetMessage.author.bot !== true) return;

    try {
        const hasEmbed = !!contextInteraction.targetMessage.reference && contextInteraction.targetMessage.embeds.length > 0;

        if (!hasEmbed) {
            if (!contextInteraction.memberPermissions?.has(PermissionFlagsBits.MoveMembers)) {
                return interaction.reply({
                    content: ERRORS.YOU_DONT_HAVE_PERMISSION,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        let extractedCard: SimpleExtractedCard;
        if (hasEmbed) {
            extractedCard = getCardFromEmbed(contextInteraction.targetMessage.embeds[0]);
        } else {
            extractedCard = getCardFromMessage(contextInteraction.targetMessage.content);
        }

        const grabbedBy = hasEmbed ? (extractedCard as FullExtractedCard).grabbedBy : contextInteraction.targetMessage.mentions.users.first()?.id;
        const addedBy = contextInteraction.member;

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

        if (hasEmbed && grabbedBy !== addedBy?.user.id) {
            return interaction.reply({
                content: ERRORS.YOU_DONT_OWN_CARD,
                flags: MessageFlags.Ephemeral
            });
        }

        // Send message
        const logsChannel = await contextInteraction.guild?.channels.fetch(config.SOFI_EVENT_DROPS_LOGS_CHANNEL_ID);
        if (!logsChannel) {
            return interaction.reply({
                content: ERRORS.CHANNEL_NOT_FOUND,
                flags: MessageFlags.Ephemeral
            })
        }

        const logMessage = await logAuctionCardMessage(logsChannel as TextChannel, addedBy?.user.id ?? '', extractedCard, hasEmbed, !hasEmbed);

        if (hasEmbed) {
            await AuctionCard.insertOne({
                eventName: extractedCard.eventName,
                cardCode: extractedCard.code,
                cardName: extractedCard.name,
                grabbedBy: grabbedBy!,
                addedBy: addedBy!.user.id,
                logMessageId: logMessage.id,
                community: false,
                cardSeries: (extractedCard as FullExtractedCard).series,
                imageUrl: (extractedCard as FullExtractedCard).imageUrl
            });
        } else {
            await AuctionCard.insertOne({
                eventName: extractedCard.eventName,
                cardCode: extractedCard.code,
                cardName: extractedCard.name,
                grabbedBy: grabbedBy!,
                addedBy: addedBy!.user.id,
                logMessageId: logMessage.id,
                community: true,
            });
        }

        return interaction.reply({
            content: "Card succesfully added to the Auction List",
            flags: MessageFlags.Ephemeral
        });

    }
    catch (ex) {
        console.error(ex);
    }
}
