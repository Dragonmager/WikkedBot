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
   else if (command === 'embed') {
    // Check if the user has the "ADMINISTRATOR" permission
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply("You don't have permission to use this command!");
    }

    // Parse arguments for embed options
    // Example usage:
    // !embed title=Hello color=#ff0000 image=https://i.imgur.com/example.png description=This is a test
    const options = {};
    args.forEach(arg => {
        const [key, ...value] = arg.split('=');
        if (key && value.length) options[key.toLowerCase()] = value.join('=');
    });

    // Build the embed
    const embed = {
        color: options.color || 0x0099ff, // default blue
        title: options.title || null,
        description: options.description || null,
        image: options.image ? { url: options.image } : null,
        timestamp: new Date(),
        footer: { text: `Sent by ${message.author.tag}` }
    };

    // Send the embed
    message.channel.send({ embeds: [embed] });
}


    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) {
        addXP(message.author.id); // XP/coins even for normal messages
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    addXP(message.author.id);

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
!purge`
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
        if (!member) return message.reply('Mention a user to kick!');
        member.kick().then(() => message.channel.send(`${member.user.tag} has been kicked.`))
        .catch(err => message.reply('I cannot kick that user.'));
    }
    else if (command === 'ban') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention a user to ban!');
        member.ban().then(() => message.channel.send(`${member.user.tag} has been banned.`))
        .catch(err => message.reply('I cannot ban that user.'));
    }
    else if (command === 'purge') {
        const amount = parseInt(args[0]);
        if (!amount) return message.reply('Specify number of messages to delete!');
        message.channel.bulkDelete(amount, true)
            .then(() => message.channel.send(`Deleted ${amount} messages`).then(msg => setTimeout(() => msg.delete(), 3000)))
            .catch(err => message.reply('Cannot delete messages'));
    }
});

// Login your bot
client.login(process.env.DISCORD_TOKEN);
// Replace with your bot token
