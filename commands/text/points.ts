// import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
// import { SofiEvent } from "../../models/SofiEvent";
// import { ERRORS } from "../../helpers/errorMessages.constants";
// import { UsersStats } from "../../models/UserStats";
// import { AuctionCard } from "../../models/AuctionCard";

// export const name = "points";

// export const data = new SlashCommandBuilder()
//     .setName(name)
//     .setDescription("See the Auction Points for Current Event");

// export async function execute(interaction: CommandInteraction) {
//     //TODO: Better errors
//     const lastEvent = await SofiEvent.findOne().sort({ startDate: -1 }).exec();
//     if (!lastEvent) {
//         return;
//     }

//     if (!lastEvent.endDate) {
//         return;
//     }

//     const daysInEvent = getDaysDifference(lastEvent.startDate, lastEvent.endDate);
//     const auctionCardsCount = await AuctionCard.countDocuments();
//     let result: string = "";

//     // Calculate points
//     var users = await UsersStats.find();
//     for (let i = 0; i < users.length; i++) {
//         const userPoints = users[i].events.get(lastEvent.eventName);
//         result += users[i].username + " " + calculateUserPoints(auctionCardsCount, userPoints?.drops, daysInEvent) + "\n";
//     }

//     //TODO: Embed
//     return interaction.reply({
//         content: result
//     });
// }

// function calculateUserPoints(auctionCards: number, drops: number | undefined, days: number) {
//     if (!drops) return 0;

//     return auctionCards + (clamp(drops, days * 25, days * 70));
// }

// function getDaysDifference(date1: Date, date2: Date): number {
//     const oneDayMs = 1000 * 60 * 60 * 24; // Milliseconds in a day
//     const diffMs = Math.abs(date1.getTime() - date2.getTime()); // Absolute difference in milliseconds
//     return Math.ceil(diffMs / oneDayMs); // Convert to days
// }

// function clamp(value: number, min: number, max: number): number {
//     return Math.max(min, Math.min(value, max));
// }