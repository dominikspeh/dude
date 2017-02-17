const Bot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

const vfb = require('./vfb');

dotenv.load({ path: '.env' });


const token = process.env.TelegramAPI;

// Create bot
const dude = new Bot(token, { polling: true });

// News Counter
const user = [];



dude.onText(/\/vfbnews/, (msg) => {
    var chatId = msg.from.id;

    var newUser = {};
    newUser[chatId] = {
        vfbnews : 0

    };
    user.push(newUser)

    dude.sendMessage(chatId, "Ok! Hier ein paar News vom VfB Stuttgart");



    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
            keyboard: [
                ["Show me more"],
                ["That's enough"],
            ]
        })
    };

    vfb.loadFeed().then(data => {

        const title = data.feed.items[0].title;
        const description = data.feed.items[0].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
        const link = data.feed.items[0].link;

        dude.sendMessage(chatId, "<b>"+title+"</b>\n"+description+"\n\n<a href='"+link+"'>Artikel lesen</a>", options);

    });

});

// REACT VFB NEWS FEED
dude.onText(/\Show me more/, (msg) => {
    const chatId = msg.from.id;
    user[0][chatId].vfbnews = user[0][chatId].vfbnews +1;

    const newIndex = user[0][chatId].vfbnews

    dude.sendMessage(chatId, "Nice! Hier weitere News vom VfB Stuttgart");

    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
            keyboard: [
                ["Show me more"],
                ["That's enough"],
            ]
        })
    };

    vfb.loadFeed().then(data => {

        const title = data.feed.items[newIndex].title;
        const description = data.feed.items[newIndex].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
        const link = data.feed.items[newIndex].link;

        dude.sendMessage(chatId, "<b>"+title+"</b>\n"+description+"\n\n<a href='"+link+"'>Artikel lesen</a>", options);

    });

});

dude.onText(/\That's enough/, (msg) => {
    const chatId = msg.from.id;
    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
            remove_keyboard: true
        })
    };

    if ( user[0][chatId] =! undefined){
        user[0][chatId].vfbnews = 0;
        dude.sendMessage(chatId, "Ok, das wars", options);

    }
    else {
        dude.sendMessage(chatId, "", options);

    }






});

