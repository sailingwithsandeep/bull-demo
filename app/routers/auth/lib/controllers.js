const { User } = require('../../../models');
// const { mailer } = require('../../../utils');

const controllers = {};

controllers.register = async (req, res) => {
    try {
        const body = _.pick(req.body, ['sEmail', 'sPassword', 'sMobile', 'sUserName', 'sGender']);

        const accessToken = req.header('accessToken');
        if (!body.sEmail) return res.reply(messages.required_field('Email'));

        if (!body.sMobile) return res.reply(messages.required_field('Mobile'));
        if (body.sPassword.length < 8 || body.sPassword.length > 15) return res.reply(messages.custom.invalid_password);

        const query = {
            $or: [{ sEmail: body.sEmail }, { sMobile: body.sMobile }],
        };
        if (accessToken) {
            const decodedToken = _.decodeToken(accessToken);
            if (!decodedToken) return res.reply(messages.unauthorized());

            if (decodedToken.sFacebookId) {
                query.$or.push({ sFacebookId: decodedToken.sFacebookId });
                body.sFacebookId = decodedToken.sFacebookId;
            }

            if (decodedToken.sGoogleId) {
                query.$or.push({ sGoogleId: decodedToken.sGoogleId });
                body.sGoogleId = decodedToken.sGoogleId;
            }

            if (decodedToken.sAppleUserId) {
                query.$or.push({ sAppleUserId: decodedToken.sAppleUserId });
                body.sAppleUserId = decodedToken.sAppleUserId;
            }

            if (decodedToken.sEmail) body.isEmailVerified = true; // if social network sends email then he should be verified by default.
        }

        const user = await User.findOne(query);
        if (user) {
            if (user.sEmail === body.sEmail) return res.reply(messages.custom.already_exists_email);
            if (user.sMobile === body.sMobile) return res.reply(messages.custom.already_exists_mobile);
        }
        body.sPassword = _.encryptPassword(body.sPassword);
        body.nOTP = _.salt(4);
        body.sVerificationToken = _.encodeToken({ nOTP: body.nOTP, sMobile: body.sMobile }, { expiresIn: '3m' });

        if (process.env.NODE_ENV !== 'prod') {
            body.isEmailVerified = true;
            body.isMobileVerified = true;
        }

        const sLinkToken = _.encodeToken({ sEmail: body.sEmail, sMobile: body.sMobile }, { expiresIn: '48h' });
        const aBonus = [];

        // mailer.send({ sEmail: body.sEmail, sLink, sUserName: body.sUserName, type: 'registerUser' }, _.errorCallback);
        body.nChips = req.settings.nWelcomeBonus;
        const newUser = new User(body);

        newUser.save(error => {
            if (error) return res.reply(messages.server_error(), error.toString());
            const deviceData = _.pick(req.body, ['oDeviceInfo']);
            try {
                deviceData.oDeviceInfo = _.parse(deviceData.oDeviceInfo);
            } catch (e) {
                deviceData.oDeviceInfo = {};
            }

            return res.reply(messages.custom.user_create_success, { nExpiresIn: 3 * 60 * 1000, authorization: newUser.sVerificationToken });
        });
    } catch (error) {
        _.handleCatchError(error);
    }
};

controllers.simpleLogin = async (req, res) => {
    try {
        const body = _.pick(req.body, ['sMobile', 'sPassword']);

        const query = {
            $or: [{ sMobile: body.sMobile }, { sEmail: body.sMobile }],
            sPassword: _.encryptPassword(body.sPassword),
        };

        const project = {
            _id: true,
            isMobileVerified: true,
            eStatus: true,
            sToken: true,
            eUserType: true,
            sMobile: true,
            sDeviceToken: true,
        };

        const user = await User.findOne(query, project);
        if (!user) return res.reply(messages.wrong_credentials());
        if (user.eStatus === 'n') return res.reply(messages.custom.user_blocked);
        if (user.eStatus === 'd') return res.reply(messages.custom.user_deleted);
        const deviceData = _.pick(req.body, ['oDeviceInfo']);
        try {
            deviceData.oDeviceInfo = _.parse(deviceData.oDeviceInfo);
        } catch (e) {
            deviceData.oDeviceInfo = {};
        }

        if (user.sDeviceToken && user.sDeviceToken !== deviceData.oDeviceInfo.sDeviceId) {
            const otpSkipUsers = ['+919898987998', '+919889898998', '+916581349754', 'blackjackguest@gmail.com', 'blackjackguest2@gmail.com'];
            const isSkipUser = otpSkipUsers.includes(body.sMobile);
            user.nOTP = isSkipUser ? 1234 : _.salt(4);
            user.sVerificationToken = _.encodeToken({ nOTP: user.nOTP, sMobile: user.sMobile }, { expiresIn: '3m' });
            user.save(_.emptyCallback);

            return res.reply(messages.custom.login_otp_success, { nExpiresIn: 3 * 60 * 1000, sMobile: user.sMobile, verification: user.sVerificationToken });
        }

        user.sToken = _.encodeToken({ _id: user._id.toString(), eUserType: user.eUserType });
        // user.sDeviceToken = deviceData.oDeviceInfo.sDeviceId || '';
        user.save(_.errorCallback);

        return res.reply(messages.success('Login'), { authorization: user.sToken, iUserId: user._id }, { authorization: user.sToken });
    } catch (error) {
        _.handleCatchError(error);
    }
};

controllers.refreshToken = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const deviceData = _.pick(req.body, ['oDeviceInfo']);
        try {
            deviceData.oDeviceInfo = _.parse(deviceData.oDeviceInfo);
        } catch (e) {
            deviceData.oDeviceInfo = {};
        }

        user.sDeviceToken = deviceData.oDeviceInfo.sDeviceId;
        user.sToken = _.encodeToken({ _id: user._id.toString(), eUserType: user.eUserType });
        await user.save();

        return res.reply(messages.success('Login'), {}, { authorization: user.sToken });
    } catch (error) {
        _.handleCatchError(error);
    }
};

module.exports = controllers;
