const Player = require("./player");
const NPlayer = require("./NPlayer");

var PlayerStartFunc = function (pl) {
    setTimeout(() => {
        pl.start();
    }, 0);
}

async function main() {
    let autoid = 1;
    let MaxCount = 1;

    for (let i = 0; i < MaxCount; i++) {
        let player = new NPlayer({ aid: autoid++ });
        PlayerStartFunc(player);

        await new Promise(resolve => setTimeout(resolve, 20));
    }

    console.log(`${MaxCount}个玩家创建完成`);
}

process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err, err.stack, err.message);
});

main();