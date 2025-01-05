const { Client, GatewayIntentBits } = require('discord.js');
const Markov = require('markov-strings');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!generate') {
        if (!message.guild) return;

        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel.isTextBased()) {
            message.channel.send('指定されたチャンネルはテキストチャンネルではありません。');
            return;
        }

        let messages = [];
        try {
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            messages = fetchedMessages
                .map(msg => msg.content)
                .filter(msg => msg.length > 5);
        } catch (err) {
            console.error('メッセージ取得エラー:', err);
            message.channel.send('メッセージ履歴の取得に失敗しました。');
            return;
        }

        const markov = new Markov({ input: messages, stateSize: 2 });
        const generatedMessage = markov.generate({ maxTries: 100, filter: result => result.score > 50 });
        message.channel.send(`生成されたメッセージ: ${generatedMessage.string}`);
    }
});

client.login(TOKEN);
