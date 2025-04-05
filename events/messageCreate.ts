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
    try {
        const referenceMessage = await message.fetchReference();
        if (!referenceMessage || (!referenceMessage.content.trim().startsWith('sev') && !referenceMessage.content.trim().startsWith("sevent")))
            return;

        const eventName = message.embeds[0].title!.split("[")[0].trim();

        const timestamp = parseInt(message.embeds[0].title!.split(":")[1].split(":")[0]);
        const eventEndDate = new Date(timestamp * 1000);

        const dbEvent = await SofiEvent.findOne({ eventName: eventName });
        if (!dbEvent) {
            await SofiEvent.insertOne({
                eventName: eventName,
                startDate: new Date(),
                endDate: eventEndDate,
                auction: null
            })
        } else if (!dbEvent.endDate) {
            await SofiEvent.findOneAndUpdate({ eventName: eventName }, { endDate: eventEndDate });
        }

        const eventTasks = message.embeds[0].description?.split("```")[1];
        const allDropsMessage = eventTasks?.split("Drop")[0];
        const eventDropsMessage = eventTasks?.split("sbump\n")[1].split("Drop")[0].trim();

        const drops = allDropsMessage!.split(" ")[1].split("/")[0].trim();
        const eventDrops = eventDropsMessage!.split(" ")[1].split("/")[0].trim();

        const user = referenceMessage.member!.user;
        const dbUser = await UsersStats.findOne({ discordId: user.id });
        if (dbUser) {
            if (dbUser.events.has(eventName)) {
                dbUser.events.get(eventName)!.drops = parseInt(drops);
                dbUser.events.get(eventName)!.eventDrops = parseInt(eventDrops);
            } else {
                dbUser.events.set(eventName, { drops: parseInt(drops), eventDrops: parseInt(eventDrops) });
            }

            await dbUser.save();
        } else {
            await UsersStats.insertOne({
                discordId: user.id,
                username: user.username,
                events: [
                    [eventName, { drops: drops, eventDrops: eventDrops }]
                ],
            });
        }


    } catch (error) { }

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

    } catch (error) { }
}