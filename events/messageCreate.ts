import { Message, OmitPartialGroupDMChannel, TextChannel } from "discord.js";
import { SofiEvent } from "../models/SofiEvent";
import { getCardFromEmbed, getCardFromMessage } from "../helpers/sofiMessages.helper";
import { AuctionCard } from "../models/AuctionCard";
import { config } from "../config";
import { UsersStats } from "../models/UserStats";

export async function onMessageReceived(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.id === "853629533855809596") {
        await handleSofiEventMessage(message);
        await handleSofiGrabMessage(message);
        await handleSofiViewMessage(message);
    }
}

async function handleSofiEventMessage(message: Message) {
    const referenceMessage = await message.fetchReference();
    if (!referenceMessage || (!referenceMessage.content.trim().startsWith('sev') && !referenceMessage.content.trim().startsWith("sevent")))
        return;

    try {
        const eventName = referenceMessage.embeds[0].title?.split("[")[0].trim();

        const dbEvent = await SofiEvent.findOne({ eventName: eventName });
        if (!dbEvent) {
            await SofiEvent.insertOne({
                eventName: eventName,
                startDate: Date.now,
                endDate: Date.now //TODO: Get Duration from message
            })
        }

        const drops = referenceMessage.embeds[0].fields[0].value;
        //TODO: Get Drops and Event Drops

        //TODO: Add to UserStats or Update
    } catch (error) { console.error(error); }

}

async function handleSofiGrabMessage(message: Message) {
    const content = message.content;
    if (!content.includes("**grabbed** the"))
        return;

    try {
        const grabbedBy = message.mentions.users.first()!;
        const card = getCardFromMessage(content);

        // Check if it's event
        const eventExists = await SofiEvent.exists({ eventName: card.eventName });
        if (!eventExists) {
            await SofiEvent.insertOne({
                startDate: new Date(),
                endDate: null,
                eventName: card.eventName,
                auction: null
            })
        }

        // Add user if not exists
        if (!(await UsersStats.exists({ discordId: grabbedBy.id }))) {
            await UsersStats.insertOne({
                discordId: grabbedBy.id,
                username: grabbedBy.username,
                events: [
                    [card.eventName, { drops: 0, eventDrops: 0 }]
                ],
            })
        }

        const dropsChannel = await message.guild?.channels.fetch(config.SOFI_EVENT_DROPS_LOGS_CHANNEL_ID);
        (dropsChannel as TextChannel).send({ content: `**${grabbedBy.username}** grabbed the card **${card.name}** (\`${card.code}\`) | **${card.eventName}** ${card.eventEmoji}` })

    } catch (error) { }
}

async function handleSofiViewMessage(message: Message) {
    if (!message.reference || message.embeds.length != 1) return;

    try {
        const referenceMessage = await message.fetchReference();
        if (!referenceMessage.content.trim().startsWith('sv') && !referenceMessage.content.trim().startsWith('sview')) return;

        const card = getCardFromEmbed(message.embeds[0]);
        const dbCard = await AuctionCard.findOne({ cardCode: card.code.toLowerCase() });
        if (!dbCard) return;

        const dropsChannel = await message.guild?.channels.fetch(config.SOFI_EVENT_DROPS_LOGS_CHANNEL_ID);
        const logMessage = await (dropsChannel as TextChannel).messages.fetch(dbCard.logMessageId);
        await logMessage.edit(logMessage.content.replace('❌', '✅'));

        await AuctionCard.findOneAndUpdate({ cardCode: card.code }, { cardSeries: card.series, imageUrl: card.imageUrl });

    } catch (error) { console.error(error); }
}