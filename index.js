const { Client, GatewayIntentBits } = require('discord.js');
const MarkovGen = require('markov-generator');
require('dotenv').config(); // .envファイルにトークンを格納する場合

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.BOT_TOKEN; // ボットのトークンを.envファイルから取得
const CHANNEL_ID = process.env.CHANNEL_ID; // メッセージ履歴を取得するチャンネルのID

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
            let fetchedMessages = await channel.messages.fetch({ limit: 100 }); // 最大100件
            messages = fetchedMessages
                .map(msg => msg.content)
                .filter(msg => msg.length > 5);
            console.log('メッセージ履歴:', messages);

        } 
        catch (err) {
            console.error('メッセージ取得エラー:', err);
            message.channel.send('メッセージ履歴の取得に失敗しました。');
            return;
        }

        // マルコフ連鎖モデルの作成
        const markov = new MarkovGen({
            input: messages,
            minLength: 5
        });

        const generatedMessage = markov.makeChain();
        message.channel.send(`生成されたメッセージ: ${generatedMessage}`);
    }
});

client.login(TOKEN);
