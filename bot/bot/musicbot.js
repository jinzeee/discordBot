
const { CommandHandler } = require('../adapter/commandhandler');
const { MusicPlayService } = require('../service/musicplayservice');
const { VoteService } = require('../service/voteservice');
const { Queue } = require('../utils/queue');

class MusicBot extends CommandHandler {
    constructor() {
        super();

        this.voteService = new VoteService();
        
        this.musicPlayService = new MusicPlayService({
            voiceChannel: null,
            connection: null,
            songs: new Queue(),
            volume: 3,
            status: 'defualt',
        });

        this.vote = false;

        this.on('skip', (msg) => {
            if (this.musicPlayService.getPlayList().length == 0) {
                return msg.reply('There is no song that I could skip!');
            }
            this.musicPlayService.skip();
        });

        this.on('play', async (msg) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel to play music!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join and speak in your voice channel');
            }
            const url = msg.content.split(' ')[1];
            let res = true;
            const song = await this.musicPlayService.extractSongFromUrl(url);
            if (this.vote) {
                const voteRes = await this.voteService.createVote(msg, 'poll', `Do you want to play the song ${song.title} ? `);
                msg.channel.send(`vote result (play the song ${song.title}) \n -- agree: ${voteRes.yes} -- disagree: ${voteRes.no} --`);
                res = voteRes.yes > voteRes.no;
            }
            if (res) {
                this.musicPlayService.play(url, voiceChannel);
                msg.reply(`now playing the song ${song.title}`);
            } else {
                msg.reply(`your song ${song.title} fails to add to the playlist`);
            }
        });

        this.on('add', async (msg) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel to play music!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join and speak in your voice channel');
            }
            const url = msg.content.split(' ')[1];
            let res = true;
            const song = await this.musicPlayService.extractSongFromUrl(url);
            if (this.vote) {
                const voteRes = await this.voteService.createVote(msg, 'poll', `Do you want to add the song ${song.title} to tge playlist? `);
                msg.channel.send(`vote result (add song ${song.title} to the playlist) \n -- agree: ${voteRes.yes} -- disagree: ${voteRes.no} --`);
                res = voteRes.yes > voteRes.no;
            }
            if (res) {
                this.musicPlayService.play(url, voiceChannel);
                msg.reply(`your song ${song.title} has been added to the playlist`);
            } else {
                msg.reply(`your song ${song.title} fails to add to the playlist`);
            }
        });

        this.on('join', async (msg) => { 
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel) {
                return msg.reply('You need to be in a voice channel!');
            }
            if (!this.hasVoicePermission(voiceChannel, msg.client.user)) {
                return msg.reply('I need the permissions to join to your voice channel');
            }
            this.musicPlayService.join(voiceChannel);
        });

        this.on('leave', async () => { 
            this.musicPlayService.leave();
        });

        this.on('volume', (msg) => {
            let volume = parseFloat(msg.content.split(' ')[1]);
            if (!isNaN(volume)) {
                if (volume < 0) {
                    volume = 0;
                }
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
        });

        this.on('remove', async (msg) => {
            const args = msg.content.split(' ');
            let idx = args.length == 1 ? 1 : parseInt(args[1]);
            if (!isNaN(idx)) {
                if (idx >= 1 && idx <= this.musicPlayService.length()) {
                    const song = await this.musicPlayService.remove(idx);
                    return msg.channel.send(`The song \" ${song.title} \" has been removed from the playlist`);
                } else {
                    return msg.reply('Invalid song index');
                }
            }
        });

        this.on('removeall', async (msg) => { 
            if (this.musicPlayService.getPlayList().length == 0) {
                return msg.reply('There is no song that I could skip!');
            }
            this.musicPlayService.skipAll();
        });

        this.on('playlist', async (msg) => {
            let songs = this.musicPlayService.getPlayList();
            let result = [`Current Playlist (${ songs.length } Songs in the list): \n`];
            for (var i = 0; i < songs.length; i++) {
                result.push((i + 1) + ". " + songs[i].title + "\n");
            }
            msg.channel.send(result.join(""));
        });

        this.on('vote', async (msg) => {
            this.vote = !this.vote;
            msg.reply(`Change the vote status to ${ this.vote ? 'ON' : 'OFF' }`);
        });

        this.on('help', async (msg) => {
            let res = ['Command List (with prefix \"!\"):\n'];
            Object.entries(this.handlers).forEach(
                (k, v) => res.push(`\t\t${k[0]}\n`)
            );
            msg.channel.send(res.join(''));
        });
    }

    hasVoicePermission(voiceChannel, user) {
        const permissions = voiceChannel.permissionsFor(user);
        return permissions.has('CONNECT') || permissions.has('SPEAK');
    }
}

exports.MusicBot = MusicBot;
