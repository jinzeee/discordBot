const { Queue } = require("./queue");

class Playlist extends Queue {
    constructor(status='defualt') {
        super();
        this.status = status;
    }

    pop() {
        let e = super.pop();
        if (!e) {
            return null;
        }
        switch (this.status) {
            case 'repeat':
                super.push(e);
                break;
            case 'loop':
                super.append(e);
                break;
        }
        return e;
    }
}

exports.Playlist = Playlist;