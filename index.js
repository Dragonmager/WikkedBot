const express = require('express'); // Add this
require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

console.log('Starting WikkedBot...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const prefix = "!";
let data = require('./data.json');

// Helper function to save JSON data
function saveData() {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

// Leveling & economy system
function addXP(userId) {
    if (!data.users[userId]) data.users[userId] = { xp: 0, level: 1, coins: 0 };
    const user = data.users[userId];
    user.xp += 10;
    user.coins += 5;

    if (user.xp >= user.level * 100) {
        user.level += 1;
        user.xp = 0;
    }

    saveData();
}

// Bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('!help for commands');
});

// Message event
client.on('messageCreate', message => {
    if (message.author.bot) return;

    // XP for normal messages
    if (!message.content.startsWith(prefix)) {
        addXP(message.author.id);
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    addXP(message.author.id);

    else if (command === 'embed') {
    if (!message.member.permissions.has('Administrator')) {
        return message.reply("You don't have permission to use this command!");
    }

    const filter = m => m.author.id === message.author.id;

    // Step 1: Title
    message.channel.send("📝 What should the **title** be?");
    message.channel.awaitMessages({ filter, max: 1, time: 30000 })
        .then(collected1 => {
            const title = collected1.first().content;

            // Step 2: Description
            message.channel.send("💬 What should the **description** be?");
            return message.channel.awaitMessages({ filter, max: 1, time: 60000 })
                .then(collected2 => {
                    const description = collected2.first().content;

                    // Step 3: Color
                    message.channel.send("🎨 What **color** should the embed be? (example: #ff0000 or blue)");
                    return message.channel.awaitMessages({ filter, max: 1, time: 30000 })
                        .then(collected3 => {
                            let colorInput = collected3.first().content.trim();
                            let color;

                            // Convert named colors or hex
                            if (colorInput.startsWith("#")) {
                                color = parseInt(colorInput.replace('#', ''), 16);
                            } else {
                                // Try to parse common names
                                const namedColors = {
                                    red: 0xff0000,
                                    blue: 0x0099ff,
                                    green: 0x00ff00,
                                    purple: 0x800080,
                                    yellow: 0xffff00,
                                    orange: 0xffa500,
                                    pink: 0xff69b4
                                };
                                color = namedColors[colorInput.toLowerCase()] || 0x0099ff;
                            }

                            // Step 4: Image
                            message.channel.send("🖼️ Optional: send an image URL or type `none` to skip.");
                            return message.channel.awaitMessages({ filter, max: 1, time: 30000 })
                                .then(collected4 => {
                                    const imageInput = collected4.first().content;
                                    const image = imageInput.toLowerCase() !== 'none' ? imageInput : null;

                                    // Build and send embed
                                    const embed = {
                                        color,
                                        title,
                                        description,
                                        image: image ? { url: image } : null,
                                        timestamp: new Date(),
                                        footer: { text: `Sent by ${message.author.tag}` }
                                    };

                                    message.channel.send({ embeds: [embed] });
                                });
                        });
                });
        })
        .catch(() => message.channel.send("⏰ You took too long! Try `!embed` again."));
}

    }

    // Basic commands
    if (command === 'ping') message.channel.send('Pong!');
    else if (command === 'help') {
        message.channel.send(
`**WikkedBot Commands**
!help
!ping
!info
!coins
!level
!serverinfo
!kick
!ban
!purge
!embed (Admin Only)`
        );
    }
    else if (command === 'coins') {
        const user = data.users[message.author.id];
        message.channel.send(`You have ${user ? user.coins : 0} coins 💰`);
    }
    else if (command === 'level') {
        const user = data.users[message.author.id];
        message.channel.send(`You are level ${user ? user.level : 1} (XP: ${user ? user.xp : 0})`);
    }
    else if (command === 'info') {
        message.channel.send('**WikkedBot** - your advanced multipurpose Discord bot!');
    }
    else if (command === 'serverinfo') {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    }

    // Moderation commands (requires permissions)
    else if (command === 'kick') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention a user to drag out the trap!');
        member.kick()
            .then(() => message.channel.send(`${member.user.tag} got dragged out the trap.`))
            .catch(() => message.reply('Cant do that.'));
    }
    else if (command === 'ban') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention a user to ban!');
        member.ban()
            .then(() => message.channel.send(`${member.user.tag} is blackballed from the trap.`))
            .catch(() => message.reply('I cannot blackball that user goofy.'));
    }
    else if (command === 'purge') {
        const amount = parseInt(args[0]);
        if (!amount) return message.reply('Specify number of messages to delete!');
        message.channel.bulkDelete(amount, true)
            .then(() => message.channel.send(`Deleted ${amount} messages`).then(msg => setTimeout(() => msg.delete(), 3000)))
            .catch(() => message.reply('Cannot delete messages'));
    }
});
// tiny web server so Render sees an open port
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('WikkedBot is running'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));


// Login your bot
client.login(process.env.DISCORD_TOKEN);
