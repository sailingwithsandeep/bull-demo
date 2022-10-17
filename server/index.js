const helmet = require('helmet');
const express = require('express');
const http = require('http');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const router = require('../app/routers');
class Server {
    initialize() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.setupMiddleware();
        this.setupServer();
    }

    setupMiddleware() {
        this.app.use(express.static('src/app/seeds/'));
        this.app.use(helmet());
        this.app.use(express.json({ limit: '100kb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(async (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            next();
        });
        this.app.use(this.routeConfig);
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/ui');

        createBullBoard({
            queues: [new BullMQAdapter('BullMQ')],
            serverAdapter,
        });
        this.app.use('/ui', serverAdapter.getRouter());
        this.app.use('/api/v1', router);
        this.app.use('*', this.routeHandler);
        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);
    }

    setupServer() {
        this.httpServer.timeout = 10000;
        this.httpServer.listen(process.env.PORT, () => log.cyan(`Spinning on ${process.env.PORT} 🌀`));
    }

    routeConfig(req, res, next) {
        if (req.path === '/ping') return res.status(200).send({});
        res.reply = ({ code, message }, data = {}, header = undefined) => {
            res.status(code).header(header).jsonp({ message, data });
        };
        next();
    }

    routeHandler(req, res) {
        res.status(404);
        res.send({ message: 'Route not found' });
    }

    logErrors(err, req, res, next) {
        log.red(`${req.method} ${req.url}`);
        log.red('body -> ', req.body);
        log.red(err.stack);
        return next(err);
    }

    errorHandler(err, req, res) {
        res.status(500);
        res.send({ message: err });
    }
}

module.exports = new Server();
