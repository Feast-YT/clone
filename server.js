const WebSocket = require('ws');
const { HttpsProxyAgent } = require("https-proxy-agent");
const Writer = require('./writer')
const Reader = require('./reader')
const fs = require("fs");

const proxy = fs.readFileSync("./proxy.txt", "utf-8").split("\n");
const userBot = {
    name: "RexlBots",
    amount: 200,
}

let bots = [];
let x = 0;
let y = 0;

const initServer = () => {
    console.log("Server started")
    const Server = new WebSocket.Server({
        port: 5000
    });
    Server.on("connection", ws => {
        console.log("Client successfully connected")
        ws.on("message", (buffer) => {
            const reader = new Reader(buffer);
            const buf = new Writer();
            const messageType = reader.readUint8();

            // console.log(messageType);
            // console.log(buffer.toString());

            switch (messageType) {
                case 0:
                    let server = buffer.toString();
                    startBots(server);
                    break;

                case 3:
                    botSplit(buf);
                    break;
                case 4:
                    botEject(buf);   
                    break;

                case 16:
                    x = buffer.readInt32LE(1);
                    y = buffer.readInt32LE(5);
                    break;

                default:
                    break;
            }
        });
        ws.on("close", e => {
            console.log("Close: " + e);
            // destroyBots();
        });
        ws.on("error", e => {
            console.log("Error: " + e);
            // destroyBots();
        });
    });
}

class Bot {
    constructor(name) {
        this.name = name;
        this.ws = null;
    }

    connect(url) {
        this.ws = new WebSocket(url, {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Origin: 'https://agar.fun',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            // agent: new HttpsProxyAgent(`http://${proxy[(~~(Math.random() * proxy.length))]}`),
        });
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    onOpen () {
        console.log('Connection Open');
        setInterval(function() {
            this.spawn();
            this.move(x, y);
        }.bind(this), 500);
    }

    move(x, y) {
        var buf = new ArrayBuffer(13);
        var dataView = new DataView(buf);
        dataView.setUint8(0, 16);
        dataView.setUint32(1, x, 1);
        dataView.setUint32(5, y, 1);
        dataView.setUint32(9, 0, 1);
        this.send(buf);
    }

    spawn() {
        var buf = new Writer();
        buf.writeUint8(0);
        buf.writeString(this.name);
        this.send(new Uint8Array(buf.bytes).buffer);
    }

    onClose() {
        console.log('Connection Closed');
    }

    onError(e) {
        console.log("Error: " + e);
    };

    send(msg) {
        if (this.ws.readyState == 1){
            this.ws.send(msg);
        }
    }
}

function botSplit(buf) {
    for (let i = 0; i < bots.length; i++) {
        var bot = bots[i];
        buf.writeUint8(17);
        bot.send(new Uint8Array(buf.bytes).buffer);
    }
}

function botEject(buf) {
    for (let i = 0; i < bots.length; i++) {
        var bot = bots[i];
        buf.writeUint8(21);
        bot.send(new Uint8Array(buf.bytes).buffer);
    }
}

function startBots(url) {
    for (let i = 0; i < userBot.amount; i++) {
        let bot = new Bot(userBot.name + "|" + i);
        bots[i] = bot;
        bot.connect(url);
    }
}

initServer();   