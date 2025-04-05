import { MessageFlags, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { getCardFromMessage, logAuctionCardMessage } from "../../helpers/sofiMessages.helper";
import { AuctionCard } from "../../models/AuctionCard";
import { ERRORS } from "../../helpers/errorMessages.constants";
import { config } from "../../config";
import { SofiEvent } from "../../models/SofiEvent";

export const customId = "submitAuctionCardWithPings"
export async function execute(interaction: StringSelectMenuInteraction) {
    let reference = await interaction.message.fetchReference();

    if (interaction.member?.user.id !== reference.member?.user.id) return;

    try {
        const extractedCard = getCardFromMessage(reference.content);
        const grabbedBy = reference.mentions.users.first()?.id;
        const addedBy = interaction.member;

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


        // Send message
        const logsChannel = await interaction.guild?.channels.fetch(config.SOFI_EVENT_DROPS_LOGS_CHANNEL_ID);
        if (!logsChannel) {
            return interaction.reply({
                content: ERRORS.CHANNEL_NOT_FOUND,
                flags: MessageFlags.Ephemeral
            })
        }

        const pings = interaction.values.map(v => `<@${v}>`).join(", ");
        const logMessage = await logAuctionCardMessage(logsChannel as TextChannel, addedBy?.user.id ?? '', extractedCard, false, true, pings);

        await AuctionCard.insertOne({
            eventName: extractedCard.eventName,
            cardCode: extractedCard.code,
            cardName: extractedCard.name,
            grabbedBy: grabbedBy!,
            addedBy: addedBy!.user.id,
            logMessageId: logMessage.id,
            community: true,
            pingedUsers: interaction.values
        });

        // Delete Select Users
        await interaction.message.delete();

        // Notify feedback
        return interaction.reply({
            content: "Card succesfully added to the Auction List",
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error(error);
    }
}