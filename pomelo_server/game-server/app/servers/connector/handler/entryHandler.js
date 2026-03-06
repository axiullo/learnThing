const logger = require('pomelo-logger').getLogger('game-server', __filename);

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function (msg, session, next) {
	next(null, { code: 200, msg: 'game server is ok.' });
};

function DoLogin(msg, session) {
	return new Promise((resolve, reject) => {
		this.app.rpc.login.playerRemote.login(session, msg, function (err, res) {
			if (err) {
				reject(err);
				return;
			}

			resolve(res);
		});
	}).catch((error) => {
		logger.warn('DoLogin error', error.message);
	});
}

Handler.prototype.login = async function (msg, session, next) {
	let result = await DoLogin.bind(this, msg, session)();

	if (!result) {
		next(null, { code: 500, msg: 'login error.' });
		return;
	}

	next(null, result);
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function (msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({ code: 200, msg: 'publish message is ok.' })
	};
	next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function (msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({ code: 200, msg: 'subscribe message is ok.' })
	};
	next(null, result);
};
