import mongoose, { Schema, Document } from 'mongoose';

interface IUserStats extends Document {
    username: string;
    discordId: string;
    events: Map<string, IEventStats>;
}

interface IEventStats {
    drops: number;
    eventDrops: number;
}

const UserStatsSchema: Schema = new Schema(
    {
        username: { type: String, required: true },
        discordId: { type: String, required: true, unique: true },
        events: {
            type: Map,
            of: {
                drops: { type: Number, default: 0 },
                eventDrops: { type: Number, default: 0 },
                points: { type: Number, default: 0 }
            },
            default: {}
        },
    },
    { timestamps: true }
);

export const UsersStats = mongoose.model<IUserStats>('UsersStats', UserStatsSchema);
