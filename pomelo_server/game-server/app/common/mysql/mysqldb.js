const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const mysql = require('mysql2/promise');
const os = require('os');

let config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '123456',
  database: process.env.MYSQL_DB || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isReconnecting = false;

function isFatal(err) {
  if (!err) return false;
  return [
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
    'PROTOCOL_PACKETS_OUT_OF_ORDER'
    // 'ER_ACCESS_DENIED_ERROR'
  ].includes(err.code);
}

async function createPool() {
  pool = mysql.createPool(config);
  console.log(`[MySQL-${process.pid}] ✅ pool created`);
  pool.on('error', async (err) => {
    console.error(`[MySQL-${process.pid}] Pool error:`, err.code);
    if (isFatal(err)) await reconnect();
  });
}

async function reconnect() {
  if (isReconnecting)
    return;

  isReconnecting = true;

  try {
    console.warn(`[MySQL-${process.pid}] ⚠️ Reconnecting...`);
    if (pool) await pool.end().catch(() => { });
    await createPool();
  } catch (e) {
    console.error(`[MySQL-${process.pid}] ❌ Reconnect failed:`, e.message);
  } finally {
    isReconnecting = false;
  }
}

async function init(dbConfig) {
  if (dbConfig) {
    config = dbConfig;
  }

  if (!pool) {
    await createPool();
  }

  let sql = `SELECT 1`;
  let rows = await query(sql);

  if (!rows) {
    console.error(`[MySQL-${process.pid}] ❌ Init failed:`);
    return false;
  }

  return true;
}

async function query(sql, params = []) {
  try {
    if (!pool) await createPool();
    const [rows, fields] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error(`[MySQL-${process.pid}] Query Error:`, err.code, err.message);

    if (isFatal(err)) {
      await reconnect();
    }

    // throw err;
    return null;
  }
}

async function transaction(taskFn) {
  if (!pool) await createPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await taskFn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    if (isFatal(err)) await reconnect();
    throw err;
  } finally {
    conn.release();
  }
}

// === 定期 ping 心跳 ===
function keepAlive(intervalMs = 20000) {
  setInterval(async () => {
    if (!pool) return;
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      // logger.debug(`[MySQL-${process.pid}] 💓 Ping OK`);
    } catch (err) {
      logger.error(`[MySQL-${process.pid}] ⚠️ Ping failed:`, err.code);

      if (isFatal(err))
        await reconnect();
    }
  }, intervalMs);
}

async function end() {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      logger.info('数据库连接池已关闭');
    } catch (err) {
      logger.error(`[MySQL-${process.pid}] ❌ 关闭连接池失败:`, err.message);
    }
  }
}

// === 获取连接状态 (给 pm2 主进程用) ===
async function status() {
  return {
    pid: process.pid,
    hostname: os.hostname(),
    connected: !!pool,
  };
}

module.exports = {
  init,
  query,
  transaction,
  keepAlive,
  status,
  end,
};
