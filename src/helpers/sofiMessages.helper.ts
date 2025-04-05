import { Embed, TextChannel } from "discord.js";

export interface SimpleExtractedCard {
    code: string;
    name: string;
    eventName: string;
    eventEmoji: string;
}

export function getCardFromMessage(content: string): SimpleExtractedCard {
    const nameSplitted = content.split("**grabbed** the **");
    const codeSplitted = content.split("card (`");
    const eventNameSplitted = content.split("(**");

    const name = nameSplitted[1].split("**")[0];
    const code = codeSplitted[1].split("`)")[0].toLowerCase();
    const event = eventNameSplitted[1].split("**)")[0].trim();
    const eventParts = event.trim().split(" ");
    const eventEmoji = eventParts.pop()!;
    const eventName = eventParts.join(" ");

    return {
        code,
        name,
        eventName,
        eventEmoji
    };
}


export interface FullExtractedCard extends SimpleExtractedCard {
    series: string;
    imageUrl: string | undefined;
    grabbedBy: string;
}

export function getCardFromEmbed(embed: Embed): FullExtractedCard {
    const splittedMessage = embed.description!.split("\n");
    const codeAndEvent = splittedMessage[3].split("•");
    const event = codeAndEvent[2].replaceAll("`", "");
    const eventParts = event.trim().split(" ");
    const eventEmoji = eventParts.pop()!;
    const eventName = eventParts.join(" ");

    return {
        name: splittedMessage[0].replaceAll("###", "").replaceAll("**", "").trim(),
        series: splittedMessage[1].replaceAll("**", "").trim(),
        code: codeAndEvent[0].replaceAll("**", "").trim().toLowerCase(),
        eventName: eventName,
        eventEmoji: eventEmoji,
        imageUrl: embed.image?.url,
        grabbedBy: splittedMessage[4].split("@")[1].replaceAll(">", "").trim(),
    };
}

export async function logAuctionCardMessage(logsChannel: TextChannel, addedByUserId: string, extractedCard: SimpleExtractedCard, hasAllInformation: boolean, isCommunity: boolean, pings?: string) {
    return await logsChannel.send({
        content: `${hasAllInformation ? '✅' : '❌'} <@${addedByUserId}> added **${extractedCard.name}** (\`${extractedCard.code}\`) to **${extractedCard.eventName}** ${extractedCard.eventEmoji} Auction Cards **(${isCommunity ? 'Community' : 'Personal'})** ${pings ? `[${pings}]` : ``}`
    });
}