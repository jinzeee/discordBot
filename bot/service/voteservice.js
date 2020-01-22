const Discord = require('discord.js'); 

class VoteService {
    async createVote(msg, title, discription) {
        let pollEmbed = new Discord.RichEmbed()
            .setTitle(title)
            .setDescription(discription + "\n Vote ends after 10 sec");
        let pollMessage = await msg.channel.send(pollEmbed);
        await pollMessage.react('✅');
        await pollMessage.react('❎');
        const result = await pollMessage.awaitReactions(
            reaction => reaction.emoji.name === '✅' || reaction.emoji.name === '❎', 
            { time : 10000 }
        );
        let agreeCount = 0;
        let disagreeCount = 0;
        if (result.get('✅')) {
            agreeCount = result.get('✅').count - 1;
        }
        if (result.get('❎')) {
            disagreeCount = result.get('❎').count - 1;
        }
        return { yes: agreeCount, no: disagreeCount };
    }
}

exports.VoteService = VoteService;
