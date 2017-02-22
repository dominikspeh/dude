const Bot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const fritzbox = require('./fritzbox');
const vfb = require('./vfb');
const temp = require('./temperature');
const smartsocket = require('./smartsocket');

// CONFIGS
dotenv.load({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
    process.exit();
});

const token = process.env.TelegramAPI;

// Create bot
const dude = new Bot(token, { polling: true });

// News Counter
var newsCounter = 0;

// SMART SOCKET
dude.onText(/\/sockets/, (msg) => {

    const fromId = msg.from.id;
    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: []
        }
    };

    smartsocket.getSockets().then(sockets => {
        for (const socket of sockets) {
            var value ;

            if (socket.mode != 0) {
                // ON
                options.reply_markup.inline_keyboard.push([
                    {
                        text : socket.name+"  ✅",
                        callback_data : JSON.stringify(
                            {
                                text: socket._id,
                                type: "sockets"
                            }
                        )
                    }
                ])
            }
            else {
                // OFF
                options.reply_markup.inline_keyboard.push([
                    {
                        text : socket.name+"  ❎",
                        callback_data : JSON.stringify(
                            {
                                text: socket._id,
                                type: "sockets"
                            }
                        )
                    }
                ])
            }

        }

        dude.sendMessage(fromId, "Welche Steckdose soll eingeschalten werden?", options);

    })
});


dude.on('callback_query', function (msg) {

    var data = JSON.parse(msg.data);

    if(data.type == "vfb"){

        var newsID = data.nr+1;

        vfb.loadFeed().then(data => {

            const title = data.feed.items[newsID].title;
            const description = data.feed.items[newsID].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
            const link = data.feed.items[newsID].link;


            dude.editMessageText("<b>"+title+"</b>\n"+description+"\n\n<a href='"+link+"'>Artikel lesen</a>",
                {
                    chat_id: msg.from.id,
                    message_id: msg.message.message_id,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "More News",
                                    callback_data: JSON.stringify(
                                        {
                                            text: "more",
                                            type: "vfb",
                                            nr: newsID
                                        }
                                    )
                                }
                            ],

                        ]
                    }
                });
        });


    }

    if(data.type == "sockets"){
        const options = {
            inline_keyboard: []

        };
        smartsocket.turnSocket(data.text).then(value => {
            dude.answerCallbackQuery(msg.id, 'Ok, Steckdose wurde angsteuert!!!');

            smartsocket.getSockets().then(sockets => {
                for (const socket of sockets) {
                    var value ;

                    if (socket.mode != 0) {

                        // ON
                        options.inline_keyboard.push([
                            {
                                text : socket.name+"  ✅",
                                callback_data : JSON.stringify(
                                    {
                                        text: socket._id,
                                        type: "sockets"
                                    }
                                )
                            }
                        ])
                    }
                    else {

                        // OFF
                        options.inline_keyboard.push([
                            {
                                text : socket.name+"  ❎",
                                callback_data : JSON.stringify(
                                    {
                                        text: socket._id,
                                        type: "sockets"
                                    }
                                )
                            }
                        ])
                    }

                }

                dude.editMessageText("Steckdose wurde angesteuert!",
                    {
                        chat_id: msg.from.id,
                        message_id: msg.message.message_id,
                        reply_markup: options
                    });


            });

        });
    }


});



// FRITZBOX
dude.onText(/\/home/, (msg) => {

    const fromId = msg.from.id;
    dude.sendMessage(fromId, "Folgende Geräte sind verbunden:");


    fritzbox.getCurrentlyHomeDevices().then(devices => {
        for (const device of devices) {
            dude.sendMessage(fromId, device.name);
        }
    });
});

// TEMPERATURE
dude.onText(/\/room_temperature/, (msg) => {

    const fromId = msg.from.id;


    temp.getHomeTemperature().then(value => {

       dude.sendMessage(fromId, "Die Temperatur beträgt "+value+"°C");

    });
});


// VFB
dude.onText(/\/vfbnews/, (msg) => {
    var chatId = msg.from.id;
    newsCounter = 0;

    dude.sendMessage(chatId, "Ok! Hier ein paar News vom VfB Stuttgart");



    const options = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "More News",
                        callback_data: JSON.stringify(
                            {
                                text: "more",
                                type: "vfb",
                                nr: 0
                            }
                            )
                    }
                ],

            ]
        }
    };

    vfb.loadFeed().then(data => {

        const title = data.feed.items[newsCounter].title;
        const description = data.feed.items[newsCounter].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
        const link = data.feed.items[newsCounter].link;

        dude.sendMessage(chatId, "<b>"+title+"</b>\n"+description+"\n\n<a href='"+link+"'>Artikel lesen</a>", options);

    });

});

// REACT VFB NEWS FEED
dude.onText(/\Show me more/, (msg) => {
    const chatId = msg.from.id;
    newsCounter++;

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

        const title = data.feed.items[newsCounter].title;
        const description = data.feed.items[newsCounter].description.replace(/<\/?[^>]+(>|$)/g,"").trim();
        const link = data.feed.items[newsCounter].link;

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

    dude.sendMessage(chatId, "Ok, das wars", options);





});



