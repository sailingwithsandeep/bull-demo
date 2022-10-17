require('./env');
require('./globals/');

const server = require('./server');
const { redis, mongoClient, getIp, bullmq } = require('./app/utils');
(async () => {
    try {
        await getIp();
        await redis.initialize();
        bullmq.initialize();
        mongoClient.initialize();
        server.initialize();
    } catch (err) {
        log.console('🤨');
        log.red(`reason: ${err.message}, stack: ${err.stack}`);
        process.exit(1);
    }
})();
process.once('uncaughtException', ex => {
    log.red(`${_.now()} we have uncaughtException, ${ex.message}, ${ex.stack}`);
    process.exit(1);
});

process.once('unhandledRejection', ex => {
    log.red(`${_.now()} we have unhandledRejection, ${ex.message}, ${ex.stack}`);
    process.exit(1);
});
