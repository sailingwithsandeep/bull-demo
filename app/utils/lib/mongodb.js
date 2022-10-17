const { connect, set, Types } = require('mongoose');

class MongoClient {
    static mongify(id) {
        return new Types.ObjectId(id);
    }

    static isEqual(id1, id2) {
        return (id1 ? id1.toString() : id1) === (id2 ? id2.toString() : id2);
    }

    constructor() {
        this.options = {
            bufferCommands: true,
            autoIndex: true,
            autoCreate: true,
        };
    }

    initialize() {
        set('bufferTimeoutMS', 2000); // 500 => 2000
        connect(process.env.DB_URL, this.options);
        log.cyan('Mongoose Initialized ◙');
    }
}

const mongoClient = new MongoClient();
module.exports = { mongoClient, MongoClient };
