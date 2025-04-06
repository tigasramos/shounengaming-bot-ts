import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SofiEvent } from "../../models/SofiEvent";
import { ERRORS } from "../../helpers/errorMessages.constants";
import { UsersStats } from "../../models/UserStats";

export const name = "stats";

export const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription("View the Drop Stats for all users");

export async function execute(interaction: CommandInteraction) {
    const lastEvent = await SofiEvent.findOne().sort({ startDate: -1 }).exec();
    if (!lastEvent) {
        return interaction.reply({
            content: ERRORS.EVENT_NOT_RUNNING,
            flags: MessageFlags.Ephemeral
        });
    }

    const users = await UsersStats.find();
    let usersStats = <UserDropStats[]>[];
    for (let i = 0; i < users.length; i++) {
        const userEvent = users[i].events.get(lastEvent.eventName);
        if (userEvent) {
            usersStats.push({
                id: users[i].discordId,
                drops: userEvent.drops,
                eventDrops: userEvent.eventDrops
            })
        }
    }

    let statsMessage = `**Stats (${lastEvent.eventName})**:`;
    usersStats = usersStats.filter(s => s.drops > 0).sort((a, b) => (b.eventDrops / b.drops) - (a.eventDrops / a.drops));
    usersStats.forEach(us => statsMessage = statsMessage + `\n<@${us.id}>: **${us.drops}** drops / **${us.eventDrops}** event drops **(${(us.eventDrops / us.drops * 100).toFixed(1)}%)**`)

    if (usersStats.length === 0) {
        statsMessage = statsMessage + "\nNo users as of now."
    }

    return interaction.reply({
        content: statsMessage,
        flags: MessageFlags.Ephemeral
    });
}

interface UserDropStats {
    id: string;
    drops: number;
    eventDrops: number;
}
