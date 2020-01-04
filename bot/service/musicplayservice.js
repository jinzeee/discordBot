"use strict"

const ytdl = require('ytdl-core');

class MusicPlayService {
    constructor(musicServer) {
        this.musicServer = musicServer;
    }

    /**
     * get all the song currently in the queue
     */
    async getPlayList() {
        return this.musicServer.songs;
    }

    /**
     * Delete all the current queue and play the song
     * @param {string} url youtube song url
     * @param {*} voiceChannel 
     */
    async skipPlay(url, voiceChannel) {
        if (!url) {
            return;
        }
        await this.skipAll();
        await this.join(voiceChannel);
        await this.addSong(url);
        this.execute();
    }

    /**
     * add a song to current playlist
     * @param {string} url youtube url
     * @param {*} voiceChannel 
     */
    async add(url, voiceChannel) {
        if (!url) {
            return;
        }
        if (this.musicServer.songs.length == 0) {
            this.skipPlay(url, voiceChannel);
        } else {
            this.addSong(url);
        }
    }

    /**
     * leave the current voice channel
     */
    async leave() {
        this.skipAll();
        if (this.musicServer.voiceChannel) {
            await this.musicServer.voiceChannel.leave();
        }
        this.musicServer.connection = null;
        this.musicServer.voiceChannel = null;
    }

    /**
     * Join a vocie channel and leave if the bot currently in another voice channel
     * nothing will happen if bot is already in the channel 
     * @param voiceChannel the voice channel that the bot require to join
     */
    async join(voiceChannel) {
        if (this.musicServer.voiceChannel != null && this.musicServer.voiceChannel == voiceChannel) {
            return;
        } else if (this.musicServer.voiceChannel != null) {
            this.leave();
        }
        try {
            this.musicServer.voiceChannel = voiceChannel;
            let connection = await voiceChannel.join();
            this.musicServer.connection = connection;
        } catch (err) {
            this.musicServer.voiceChannel = null;
			throw new Error('Unable to connect to the channel');
        }
    }

    /**
     * Skip a song in the playlist
     */
    async skip() {
        if (this.musicServer.songs.length != 0 && this.musicServer.connection) {
            await this.musicServer.connection.dispatcher.end();
        }
    }

    /**
     * terminate and delete all the song in the playlist
     */
    skipAll() {
        if (this.musicServer.songs.length != 0 && this.musicServer.connection) {
            this.musicServer.songs = [];
            this.musicServer.connection.dispatcher.end();
        }
    }

    /**
     * Set the volume of the audio
     * @param {float} volume
     */
    setVolume(volume) {
        this.musicServer.volume = volume;
        if (this.musicServer.connection && this.musicServer.connection.dispatcher) {
            this.musicServer.connection.dispatcher.setVolumeLogarithmic(this.musicServer.volume / 5);
        }
    }

    /**
     * Play the song on the top of the list
     */
    async execute() {
        if (this.musicServer.songs.length != 0) {
            console.log('start to play music: ', this.musicServer.songs[0]);
            const dispatcher = this.musicServer.connection.playStream(ytdl(this.musicServer.songs[0].url))
                .on('end', () => {
                    console.log('music ended: ', this.musicServer.songs[0]);
                    this.musicServer.songs.shift();
                    this.execute();
                })
                .on('error', error => {
                    console.error(error);
                });
            dispatcher.setVolumeLogarithmic(this.musicServer.volume / 5);
        }
    }

    /**
     * Add a song to the queue by url
     * @param {String} url 
     */
    async addSong(url) {
        const songInfo = await ytdl.getInfo(url);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
        };
        this.musicServer.songs.push(song);    
    }    
    
    /**
     * get all the song currently in the queue
     */
    getPlayList() {
        return this.musicServer.songs;
    }
}

exports.MusicPlayService = MusicPlayService;
