const { REQUEST_TIMEOUT } = require("./config/HttpStatus");

const PlayerState = Object.freeze({
    None: 0,
    Login: 1,
    EnterHall: 2,
    Play: 3
});

const ResCode = Object.freeze({
    SUCCESS: 200,
});

module.exports = {
    PlayerState: PlayerState,
    ResCode: ResCode,
    LoginURL: "http://111.119.253.225:3001/",
}