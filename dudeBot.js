const Bot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

const vfb = require('./vfb');

dotenv.load({ path: '.env' });

console.log(vfb.loadFeed());

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TelegramAPI;

// Create a bot that uses 'polling' to fetch new updates
const robot = new Bot(token, { polling: true });

// Matches "/echo [whatever]"
robot.onText(/\/echo (.+)/, function (msg, match) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    var chatId = msg.chat.id;
    var resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    robot.sendMessage(chatId, resp);
});

robot.onText(/\/vfbnews/, (msg) => {
    const chatId = msg.from.id;


    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    vfb.loadFeed().then(data => {
        robot.sendMessage(chatId, "Ok! Hier ein paar News vom VfB Stuttgart");

        const title = data.feed.items[0].title;
        const description = data.feed.items[0].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
        const link = data.feed.items[0].link;

        robot.sendMessage(chatId, "<b>"+title+"</b>\n"+description+"\n\n<a href='"+link+"'>Artikel lesen</a>", options);

    });

});

