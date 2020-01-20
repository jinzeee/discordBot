class CommandHandler {
    constructor() {
        this.handlers = {};
    }

    on(cmd, handler) {
        if (!this.handlers[cmd]) {
            this.handlers[cmd] = [handler];
        } else {
            this.handlers[cmd].push(handler);
        }
    }

    handle(cmd, msg) {
        const handlers = this.handlers[cmd] || [];
        handlers.forEach(handler => {
            handler(msg);
        });
    }

    cmdList() {
        this.handlers.forEach((k, v) => {

        })
    }
}

exports.CommandHandler = CommandHandler;
