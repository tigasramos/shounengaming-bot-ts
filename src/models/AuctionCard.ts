import mongoose, { Schema, Document } from 'mongoose';

interface IAuctionCard extends Document {
    eventName: string;
    cardCode: string;
    cardName: string;
    cardSeries?: string;
    imageUrl?: string;
    pingedUsers: string[] | null | undefined;
    grabbedBy: string;
    addedBy: string;
    community: boolean;
    logMessageId: string;
}

const AuctionCardSchema: Schema = new Schema(
    {
        eventName: { type: String, required: true },
        cardCode: { type: String, required: true, unique: true },
        cardName: { type: String, required: true },
        cardSeries: { type: String },
        imageUrl: { type: String },
        pingedUsers: { type: [String], required: false },
        grabbedBy: { type: String, required: true },
        addedBy: { type: String, required: true },
        community: { type: Boolean, required: true, default: true },
        logMessageId: { type: String, required: true }
    },
    { timestamps: true }
);

export const AuctionCard = mongoose.model<IAuctionCard>('AuctionCard', AuctionCardSchema);
