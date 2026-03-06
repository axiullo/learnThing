
const util = require('util');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { pid } = process;

let logLevel = process.env.APP_ENV !== 'production' ? 'debug' : 'info';
let now = Date.now();

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        // winston.format.json()
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
            if (typeof message != 'string') {
                message = util.inspect(message, {
                    depth: null,
                    colors: false,
                    maxArrayLength: null
                });
            }

            let msg = `${timestamp} [pid=${process.pid}] [${level}] : ${message} `;

            if (Object.keys(metadata).length > 0) {
                msg += util.inspect(metadata, {
                    depth: 0,
                    colors: false,
                    maxArrayLength: null
                });
            }

            return msg;
        })
    ),
    transports: [
        // 错误日志
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d'
        }),
        // 信息日志
        new DailyRotateFile({
            filename: `logs/combined-${pid}-%DATE%-${now}.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

// 如果不是生产环境，添加控制台输出
if (process.env.APP_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.printf(({ level, message, timestamp, ...metadata }) => {
                    if (typeof message != 'string') {
                        message = util.inspect(message, {
                            depth: null,
                            colors: false,
                            maxArrayLength: null
                        });
                    }

                    let msg = `${timestamp} [pid=${process.pid}] [${level}] : ${message} `;

                    if (Object.keys(metadata).length > 0) {
                        msg += util.inspect(metadata, {
                            depth: 1,
                            colors: false,
                            maxArrayLength: null
                        });
                    }

                    return msg;
                })
                
                //winston.format.simple()            
            ),
        })
    );
}

module.exports = logger;