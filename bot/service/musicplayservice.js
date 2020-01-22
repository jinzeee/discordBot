const ytdl = require('ytdl-core');

class MusicPlayService {
    constructor(musicServer) {
        this.musicServer = musicServer;
    }

    /**
     * get all the song currently in the queue
     */
    getPlayList() {
        return this.musicServer.songs.toList();
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
        this.skipAll();
        await this.join(voiceChannel);
        await this.addSong(url);
        await this.execute();
    }

    /**
     * add a song to the end of the current playlist
     * @param {string} url youtube url
     * @param {*} voiceChannel 
     */
    async add(url, voiceChannel) {
        if (!url) {
            return;
        }
        if (this.musicServer.songs.isEmpty()) {
            this.skipPlay(url, voiceChannel);
        } else {
            this.addSong(url);
        }
    }

    /**
     * add a song to the start of the current playlist
     * @param {string} url 
     * @param {*} voiceChannel 
     */
    async play(url, voiceChannel) {
        if (!url) {
            return
        }
        if (this.musicServer.songs.isEmpty()) {
            this.skipPlay(url, voiceChannel);
        } else {
            await this.addSong(url, true);
            this.musicServer.songs.push('dummy');
            await this.musicServer.connection.dispatcher.end();
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
        if (this.musicServer.voiceChannel != null && this.musicServer.voiceChannel != voiceChannel) {
            this.leave();
        }
        try {
            console.log('try to join voice channel: ', voiceChannel.name);
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
        if (this.musicServer.connection && this.musicServer.connection.dispatcher) {
            await this.musicServer.connection.dispatcher.end();
        }
    }

    /**
     * return the length of the playlist
     */
    length() {
        return this.musicServer.songs.size;
    }

    /**
     * remove a song from the playlist at given index and return the song info
     * @param {Int} idx the index of the song in the playlist
     */
    async remove(idx=1) {
        if (idx == 1) {
            let res = this.musicServer.songs.peek();
            await this.skip();
            return res;
        }
        return this.musicServer.songs.remove(idx);        
    }

    /**
     * terminate and delete all the song in the playlist
     */
    skipAll() {
        this.musicServer.songs.removeAll();
        if (this.musicServer.connection && this.musicServer.connection.dispatcher) {
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
        if (!this.musicServer.songs.isEmpty()) {
            console.log('start to play music: ', this.musicServer.songs.peek());
            const dispatcher = this.musicServer.connection.playStream(ytdl(this.musicServer.songs.peek().url, { filter: 'audioonly' }))
                .on('end', () => {
                    console.log('music ended: ', this.musicServer.songs.peek());
                    this.musicServer.songs.pop();
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
     * @param {string} url 
     */
    async addSong(url, toFront=false) {
        const song = await this.extractSongFromUrl(url);
        if (!song) {
            return false;
        }
        if (!toFront) {
            this.musicServer.songs.append(song);  
        } else {
            this.musicServer.songs.push(song);
        }
        return true;
    }

    /**
     * extract the song info from the url
     * @param {string} url
     */
    async extractSongFromUrl(url) {
        try {
            const songInfo = await ytdl.getInfo(url);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url,
            };
            return song;
        } catch {
            return null;
        }
    }
}

exports.MusicPlayService = MusicPlayService;
