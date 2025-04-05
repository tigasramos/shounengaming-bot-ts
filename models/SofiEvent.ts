import mongoose, { Schema, Document } from 'mongoose';


export enum AuctionRoundState {
    NOT_STARTED,
    IN_PROGRESS,
    FINISHED,
}

export enum AuctionMessageType {
    WISHLIST,
    PERSONAL,
    GENERAL
}

interface ISofiEvent extends Document {
    eventName: string;
    startDate: Date;
    endDate?: Date;

    auction?: {
        rounds: [{
            number: number;
            cardsAuction: [{
                code: string;
                threadId?: string;
                state: AuctionRoundState;
                lastBid?: {
                    userDiscordId: string;
                    points: number;
                    bidDate: Date;
                };
                dropoutsDiscordIds?: string[];
            }]
            state: AuctionRoundState;
        }],

        auctionChannelId: string;
        messagesIds: [{
            messageId: string;
            type: AuctionMessageType;
            cardsCodes: string[];
        }]
        pointsMessageId: string;
        roundManagerMessageId: string;
    }
}

const SofiEventSchema: Schema = new Schema(
    {
        eventName: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },

        auction: {
            rounds: [
                {
                    number: { type: Number, required: true },
                    cardsAuction: [
                        {
                            code: { type: String, required: true },
                            threadId: { type: String },
                            state: { type: String, enum: Object.values(AuctionRoundState), required: true },
                            lastBid: {
                                userDiscordId: { type: String, required: true },
                                points: { type: Number, required: true },
                                bidDate: { type: Date, required: true },
                            },
                            dropoutsDiscordIds: [{ type: String }],
                        },
                    ],
                    state: { type: String, enum: Object.values(AuctionRoundState), required: true },
                },
            ],

            auctionChannelId: { type: String },
            messagesIds: [
                {
                    messageId: { type: String, required: true },
                    type: { type: String, enum: Object.values(AuctionMessageType), required: true },
                    cardsCodes: [{ type: String, required: true }],
                },
            ],
            pointsMessageId: { type: String },
            roundManagerMessageId: { type: String },
        },
    },
    { timestamps: true }
);

export const SofiEvent = mongoose.model<ISofiEvent>('SofiEvent', SofiEventSchema);
