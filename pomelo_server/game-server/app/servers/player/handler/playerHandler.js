const logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = function (app) {
    return new PlayerHandler(app);
}

function PlayerHandler(app) {
    this.app = app;
}

PlayerHandler.prototype.name = 'playerHandler';

PlayerHandler.prototype.enter = function (msg, session, next) {
    logger.info('enter', msg);

    next(null, {
        code: 200,
        msg: 'enter success'
    });
}