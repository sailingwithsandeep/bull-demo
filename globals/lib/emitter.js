const { EventEmitter } = require('events');

class Emitter extends EventEmitter {
    asyncEmit = (channel, data) => new Promise(resolve => _emitter.emit(channel, data, resolve));
}
const _emitter = new Emitter();

module.exports = _emitter;
