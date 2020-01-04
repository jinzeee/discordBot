
const { CommandHandler } = require('../adapter/commandhandler');
const { MusicPlayService } = require('../service/musicplayservice');

class MusicBot extends CommandHandler {
    constructor() {
        super();
        
        this.musicPlayService = new MusicPlayService({
            voiceChannel: null,
            connection: null,
            songs: [],
            volume: 3
        });

        this.on('!skip', (msg) => {
            if (this.musicPlayService.getPlayList().length == 0) {
                return msg.reply('There is no song that I could skip!');
            }
            this.musicPlayService.skip();
        });

        this.on('!play', (msg) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel to play music!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join and speak in your voice channel');
            }
            const url = msg.content.split(' ')[1];
            this.musicPlayService.skipPlay(url, voiceChannel);
        });

        this.on('!add', async (msg) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel to play music!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join and speak in your voice channel');
            }
            const url = msg.content.split(' ')[1];
            this.musicPlayService.add(url, voiceChannel);
            return msg.reply("Your song has been added to the playlist");
        });

        this.on('!join', async (msg) => { 
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join to your voice channel');
            }
            this.musicPlayService.join(voiceChannel);
        });

        this.on('!leave', async () => { 
            this.musicPlayService.leave();
        });

        this.on('!volume', (msg) => {
            const volume = parseFloat(msg.content.split(' ')[1]);
            if (volume) {
                if (volume > 5) {
                    return msg.reply('Why do you want to hurt your ear?');
                } else {
                    this.musicPlayService.setVolume(volume);
                    const occupied = '#';
                    const empty = '-';
                    const volumePercentage = Math.ceil(volume / 5 * 10);
                    return msg.channel.send('Current Volume: [' + occupied.repeat(volumePercentage) 
                                    + empty.repeat(10 - volumePercentage) + ']');
                }
            }
        })

        this.on('!skipall', async (msg) => { 
            if (this.musicPlayService.getPlayList().length == 0) {
                return msg.reply('There is no song that I could skip!');
            }
            this.musicPlayService.skipAll();
        });

        this.on('!playlist', async (msg) => {
            let songs = this.musicPlayService.getPlayList();
            let result = [`Current Playlist (${ songs.length } Songs in the list): \n`];
            for (var i = 0; i < songs.length; i++) {
                result.push((i + 1) + ". " + songs[i].title + "\n");
            }
            msg.channel.send(result.join(""));
        });
    }

    hasVoicePermission(voiceChannel, user) {
        const permissions = voiceChannel.permissionsFor(user);
        return permissions.has('CONNECT') || permissions.has('SPEAK');
    }
}

exports.MusicBot = MusicBot;
