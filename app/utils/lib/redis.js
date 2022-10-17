/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
class RedisClient {
    constructor() {
        this.pubSubOptions = {
            url: `redis://${process.env.PUBSUB_REDIS_HOST}:${process.env.PUBSUB_REDIS_PORT}`,
            username: process.env.PUBSUB_REDIS_USERNAME,
            password: process.env.PUBSUB_REDIS_PASSWORD,
            legacyMode: false,
        };

        this.schedularOptions = {
            url: `redis://${process.env.SCHEDULER_REDIS_HOST}:${process.env.SCHEDULER_REDIS_PORT}`,
            username: process.env.SCHEDULER_REDIS_USERNAME,
            password: process.env.SCHEDULER_REDIS_PASSWORD,
            legacyMode: false,
        };

        this.gameplayOptions = {
            url: `redis://${process.env.GAMEPLAY_REDIS_HOST}:${process.env.GAMEPLAY_REDIS_PORT}`,
            username: process.env.GAMEPLAY_REDIS_USERNAME,
            password: process.env.GAMEPLAY_REDIS_PASSWORD,
            legacyMode: false,
        };
    }

    async initialize() {
        try {
            this.client = createClient(this.gameplayOptions);
            this.publisher = createClient(this.pubSubOptions);
            this.subscriber = createClient(this.pubSubOptions);
            this.sch = createClient(this.schedularOptions);
            this.schSubs = createClient(this.schedularOptions);

            await Promise.all([this.client.connect(), this.publisher.connect(), this.subscriber.connect(), this.sch.connect(), this.schSubs.connect()]);
            log.cyan('Redis initialized ⚡');
            try {
                const kspRes = await this.sch.CONFIG_SET('notify-keyspace-events', 'Ex');
                log.cyan(`ksp: ${kspRes}`);
            } catch (err) {
                log.blue(`key space error: ${err.message}`);
            }

            this.client.on('error', log.red);
            this.publisher.on('error', log.red);
            this.subscriber.on('error', log.red);
        } catch (error) {
            log.red(`${_.now()} Error Occurred on redis initialize. reason :${error.message}`);
        }
    }

    getAdapter() {
        return createAdapter(this.publisher, this.subscriber);
    }
}

module.exports = new RedisClient();
/*
    redis.publisher.publish('redisEvent', JSON.stringify({ a: 10, b: 20 }));
    then on onMessage we got :> channel : 'redisEvent, message: '{ a: 10, b: 20 }'

    redis.publisher.publish('redisEvent', JSON.stringify({ sTaskName: '', iTabled: '', iUserId: '' }));
     channel : redisEvent
     message: { sTaskName: '', iTabled: '', iUserId: '' }

*/

/*
    redis-commander --redis-host redis-14637.c301.ap-south-1-1.ec2.cloud.redislabs.com --redis-port 14637 --redis-password kderTDhubKYjmcW1ilCdjly0fFNdxihJ
    export VIEW_JSON_DEFAULT=all && redis-commander
    redis-cli -h redis-16750.c275.us-east-1-4.ec2.cloud.redislabs.com -p 16750 -a 1LUOg6WlPX6eK15Shtfa0iLUGsdjkNlc
*/

/*
    "local channel = redis.call('zrangebyscore', KEYS[1], ARGV[1], ARGV[2], 'LIMIT', 0, 1);" +
    'channel = unpack(channel);' +
    'if (channel==nil) then return nil; end ' +
    "local isRemoved = redis.call('zrem', KEYS[1], channel);" +
    'if (isRemoved~=1) then return nil; end ' + //
    'return channel;',
*/
