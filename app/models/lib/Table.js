const mongoose = require('mongoose');

const Table = new mongoose.Schema(
    {
        iProtoId: mongoose.Schema.Types.ObjectId,
        iCreatedBy: mongoose.Schema.Types.ObjectId,
        nTableFee: { type: Number, default: 0 },
        nTablePoint: { type: Number, default: 0 }, // required for Pool rummy
        nRackPercentage: { type: Number, default: 15 },
        nMaxPlayer: { type: Number, enum: [2, 6] },
        nBonus: { type: Number, default: 0 },
        nTableRound: { type: Number, default: 1 },
        // sPrivateCode: String,
        aWinner: [
            {
                iUserId: mongoose.Schema.Types.ObjectId,
                sUserName: String,
                nAmount: Number,
                nTableRound: Number,
                nWinningAmount: Number,
                dCreatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        aParticipant: [{ iUserId: mongoose.Schema.Types.ObjectId, sRemoteAddress: String }],
        // aAllowedBot: {
        //     type: [Number],
        //     default: [1, 2],
        // },
        bFreezed: {
            type: Boolean,
            default: false,
        },
        eState: {
            type: String,
            enum: ['waiting', 'initialized', 'initializing', 'playing', 'declaring', 'declared', 'finished'], // removed initPlaying
            default: 'waiting',
        },
        // eRummyType: {
        //     type: String,
        //     enum: ['point', 'pool', 'deal', 'point21'],
        // },
        eGameType: {
            type: String,
            enum: ['cash', 'practice'],
            default: 'cash',
        },
        eStatus: {
            type: String,
            enum: ['y', 'd'],
            default: 'y',
        },
        eOpponent: {
            type: String,
            enum: ['bot', 'user', 'any'],
            default: 'any',
        },
        nAmountIn: {
            type: Number,
            default: 0,
        },
        nAmountOut: {
            type: Number,
            default: 0,
        },
        nBonusIn: {
            type: Number,
            default: 0,
        },
        nBonusOut: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: { createdAt: 'dCreatedDate', updatedAt: 'dUpdatedDate' } }
);

module.exports = mongoose.model('tables', Table);

/**
 * iUserTurn: mongoose.Schema.Types.ObjectId,
 * iDealerId: mongoose.Schema.Types.ObjectId,
 * nTurnTime: Number, // in millisecond, // manage at settings level
 * nGraceTime: Number, // manage at settings level
 * nTableRound: { type: Number, default: 0 },
 * aClosedDeck: [Card],
 * oWildJoker: Card,
 * aOpenDeck: [Card],
 * aWinner: [mongoose.Schema.Types.ObjectId],
 *
 */
