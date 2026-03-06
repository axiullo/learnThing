const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const MsgConst = require('../../../consts/msgConst');

module.exports = function (app) {
    return new Handler(app);
}

function Handler(app) {
    this.app = app;
}

Handler.prototype.name = 'loginHandler';

Handler.prototype.login = function (msg, session, next) {
    logger.info('login, msg', msg);

    next(null, {
        code: MsgConst.ResultCode.SUCCESS,
        msg: 'login success'
    });
}

/**
 * 注册
 * @param {*} err 
 * @param {*} msg  {account: 'account', password: 'password'}
 * @param {*} session 
 * @param {*} resp 
 * @param {*} next 
 */
Handler.prototype.register = async function (msg, session, next) {
    let account = msg.account;
    let password = msg.password;

    // 校验参数
    if (!account || !password) {
        next(null, {
            code: MsgConst.ResultCode.FAIL,
            msg: MsgConst.ResultDesc.ParamError
        });
        return;
    }

    //todo: 这里去做事务, 先查询账号是否存在, 不存在才去注册.
    let findResult = await userDao.getUserByAccount(account);

    if (findResult) {
        next(null, {
            code: MsgConst.ResultCode.FAIL,
            msg: MsgConst.ResultDesc.AccountExist
        });
        return;
    }




    next();
}