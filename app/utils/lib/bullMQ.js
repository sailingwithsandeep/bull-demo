const { Queue, Worker } = require('bullmq');
class BullMQ {
    constructor() {
        this.options = {
            host: process.env.SCHEDULER_REDIS_HOST,
            port: process.env.SCHEDULER_REDIS_PORT,
            username: process.env.SCHEDULER_REDIS_USERNAME,
            password: process.env.SCHEDULER_REDIS_PASSWORD,
            legacyMode: false,
        };
    }
    initialize() {
        // this.queue = new Queue('BullMQ', {
        //     connection: this.options,
        // });
        // this.worker = new Worker(
        //     'BullMQ',
        //     async job => {
        //         console.log('job');
        //         return;
        //     },
        //     { connection: this.options }
        // );
        // this.queue.add('firstJob', { data: 'hello' });
        // this.worker.on('completed', job => {
        //     console.log(`${job.id} has completed!`);
        // });
        log.cyan('BullMQ Initialized 🐂');
    }
}

module.exports = new BullMQ();
