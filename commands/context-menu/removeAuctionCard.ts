import { ApplicationCommandType, CommandInteraction, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, MessageFlags, PermissionFlagsBits, TextChannel } from "discord.js";
import { ERRORS } from "../../helpers/errorMessages.constants";
import { AuctionCard } from "../../models/AuctionCard";
import { FullExtractedCard, getCardFromEmbed, getCardFromMessage, SimpleExtractedCard } from "../../helpers/sofiMessages.helper";
import { config } from "../../config";

export const name = "Remove Card from Auction";

export const data = new ContextMenuCommandBuilder()
    .setName(name)
    .setType(ApplicationCommandType.Message);

export async function execute(interaction: CommandInteraction) {
    const contextInteraction = interaction as MessageContextMenuCommandInteraction;

    if (contextInteraction.targetMessage.author.bot !== true) return;

    try {
        const hasEmbed = contextInteraction.targetMessage.reference && contextInteraction.targetMessage.embeds.length > 0;

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
        const removedBy = contextInteraction.member;

        // Check if card already exists
        const dbCard = await AuctionCard.findOne({ cardCode: extractedCard.code });
        if (!dbCard) {
            return interaction.reply({
                content: ERRORS.CARD_NOT_REGISTERED,
                flags: MessageFlags.Ephemeral
            });
        }


        if (hasEmbed && grabbedBy !== removedBy?.user.id && !dbCard.community) {
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

        await (logsChannel as TextChannel).send({
            content: `<@${removedBy?.user.id}> removed **${extractedCard.name}** (\`${extractedCard.code}\`) from **${extractedCard.eventName}** ${extractedCard.eventEmoji} Auction Cards **(${!dbCard.community ? 'Personal' : 'Community'})**`
        });

        await AuctionCard.deleteOne({
            cardCode: extractedCard.code,
        });

        return interaction.reply({
            content: "Card succesfully removed from the Auction List",
            flags: MessageFlags.Ephemeral
        });
    }
    catch (ex) {
        console.error(ex);
    }

}