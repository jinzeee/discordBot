const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();

const { prefix } = require('./config.json');
const { MusicBot } = require('./bot/musicbot');

const musicbot = new MusicBot();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot || !msg.content.startsWith(prefix)) {
        return;
    }
    const cmd = msg.content.split(' ')[0].slice(1).toLowerCase();
    musicbot.handle(cmd, msg);
});

client.login(process.env.BOT_TOKEN);