var pomelo = require('pomelo');
const fs = require('fs');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const dispatcher = require('./app/util/dispatcher');
const db = require('./app/mod/db');
const timeUtil = require('./app/util/timeUtil');
const syncComponent = require('pomelo-sync-plugin');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'gameserver');

// app configuration
app.configure('production|development', 'connector', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      heartbeat: 3,
      // useDict : true,
      useProtobuf: true
    });
});

function loginBeforeFilter(msg, session, next) {
  console.log('loginBeforeFilter', msg, session);
  next();
}

function loginAfterFilter(err, msg, session, resp, next) {
  console.log('loginAfterFilter', err, msg, session, resp);
  next();
}

app.configure('production|development', 'login', async function () {
  //对login服路由进行分发规则
  app.route("login", dispatchLogin);

  //模块加载
  const DataManager = require('./app/manager/dataManager');
  let dataManager = new DataManager(app);
  app.set('dataManager', dataManager, true);
  app.set('db', db, true);

  app.before(loginBeforeFilter);
  app.after(loginAfterFilter);

  // app.use(syncComponent, { syncComponent: { path: __dirname + '/app/dao/mapping/', dbClient: db, interval: 10000 } });
});

app.configure('production|development', 'pkplayer', function () {

});

// 初始化Pomelo组件，但不立即监听端口
async function bootstrap() {
  await new Promise(resolve => {
    app.start(function () {
      console.log(`[${app.serverId}] 已完成基础启动`);
      resolve();
    });
  });

  if (!app.components.__connector__) {
    app.set('serverStatus', 'ready');
    return;
  }

  // 阻止 connector 自动监听
  app.components.__connector__.stop(true, function () {
    console.log(`[${app.serverId}] 已阻止 connector 自动监听`);
  });

  console.log(`[${app.serverId}] 等待 player 服务器就绪...`);

  // const ok = await waitForServerReady(app, 'player', 10, 2000);
  // if (!ok) {
  //     console.error(`[${app.serverId}] player 服务器未就绪，退出`);
  //     process.exit(1);
  // }

  console.log(`[${app.serverId}] 所有依赖就绪，启动监听端口...`);

  await app.components.__connector__.start(function () {
    console.log(`[${app.serverId}] 已完成监听端口启动`);
  });

  app.set('serverStatus', 'ready');
}

// start app
bootstrap().catch(e => {
  console.error('Fatal error during startup:', e.message, e.stack);
  process.exit(1);
});

/**
 * 
 * @param {*} routeParam 
 * @param {*} msg 
 * @param {*} context 
 * @param {*} cb 
 */
function dispatchLogin(routeParam, msg, context, cb) {
  let servers = dispatcher.GetCfgServers('login');
  let id = servers[routeParam.id % servers.length].id;

  cb(null, id);
}

//对uncaughtException事件进行处理，将异常信息写入文件  
process.on('uncaughtException', function (err) {
  if (err.emitted) {
    // 已经通过 dataException 处理过，跳过
    return;
  }

  logger.error(`Caught exception: stack=${err.stack}`);

  if (!app.get("hasUncaughtDir")) {
    if (!fs.existsSync("uncaught")) {
      fs.mkdirSync("uncaught");
    }

    app.set("hasUncaughtDir", true);
  }

  let now = new Date();
  let dateStr = timeUtil.formatTime(now, "YYYYMMDD");
  let content = `\n${now.toLocaleString()} uncaught  msg=${err.message} \n stack=${err.stack} \n`;
  fs.promises.appendFile('uncaught/' + app.getServerId() + "_" + dateStr + ".txt", content)
    .catch(writeErr => {
      console.error('Error writing exception log:', writeErr);
    });
});

/**
 * 捕获数据异常, 传入玩家id, 强制玩家下线
 */
process.on('dataException', function (err) {
  logger.error(`Caught dataException: uid=${err.uid}, message=${err.message}, stack=${err.stack}`);
});
