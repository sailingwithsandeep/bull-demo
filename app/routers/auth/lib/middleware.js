const { User } = require('../../../models');

const middleware = {};

middleware.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('authorization');
        if (!token) return res.reply(messages.unauthorized());

        const decodedToken = _.decodeToken(token);
        if (!decodedToken) return res.reply(messages.unauthorized());

        const project = {
            sUserName: true,
            sEmail: true,
            sMobile: true,
            sAvatar: true,
            eStatus: true,
            eUserType: true,
            sToken: true,
            nChips: true,
            nPracticeChips: true,
            aTable: true,
            nWithdrawable: true,
            aAllowedBot: true,
            eOpponent: true,
            isEmailVerified: true,
        };

        const user = await User.findOne({ _id: decodedToken._id }, project);
        if (!user) return res.reply(messages.custom.user_not_found);
        if (user.sToken !== token) return res.reply(messages.unauthorized());
        if (user.eUserType !== 'user') return res.reply(messages.unauthorized());
        if (user.eStatus === 'd') return res.reply(messages.custom.user_deleted);
        if (user.eStatus === 'n') return res.reply(messages.custom.user_blocked);
        req.user = user;
        next();
    } catch (error) {
        return res.reply(messages.server_error(), error.toString());
    }
};

module.exports = middleware;
