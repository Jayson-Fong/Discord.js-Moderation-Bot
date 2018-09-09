const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const adminsLock = config.admins;
const cooldown = new Set();
function addCooldown(id) {
	cooldown.add(id);
	setTimeout(() => {
		cooldown.delete(id);
	}, config.cooldown);
}
client.on("ready", () => {
	console.log(`
		[STATUS] Online
		  --> Reaching ${client.users.size} Users
		  --> Access to ${client.channels.size} Channels
		  --> In ${client.guilds.size} Guilds
	`);
	client.user.setPresence({game: {name: config.presence.game}, status: config.presence.status});
	if (config.debug) {
        	console.log(`
                	[INFO] Applied Presence
                	  --> Game of "${config.presence.game}"
        	          --> Status of "${config.presence.status}"
 	       `);
	}
});
client.on("message", async message => {
	if (message.author.bot) return;
	if (message.content.indexOf(config.prefix) !== 0) return;
	if (
		cooldown.has(message.author.id) &&
		((message.member &&
		!message.member.roles.some(r=>config.moderationGroups.includes(r.name)) &&
		!config.moderatorCooldown) ||
		!config.admins.includes(message.author.id))
	) {
		await message.reply(`Sorry, you're currently under cooldown, ${message.author}!`);
	}
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	switch (command) {
		case "ping":
			case "pong":
				const msg = await message.channel.send("Please wait. Testing latency.");
				await msg.edit(`
					Pong! Latency test complete.
					\`\`\`Latency: ${msg.createdTimestamp - message.createdTimestamp}ms
					API Latency: ${Math.round(client.ping)}ms\`\`\`
				`)
					.catch(error => console.log(`Something Went Wrong: $error}`));
				addCooldown(message.author.id);
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
		case "roll":
			case "dice":
				await message.reply(`I choose ${Math.floor((Math.random() * 6) + 1)}!`);
				addCooldown(message.author.id);
                                if (message.deletable) await message.delete()
                                        .catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
		case "bork":
			message.channel.send("Bork!");
			addCooldown(message.author.id);
			if (message.deletable) await message.delete()
				.catch(error => console.log(`Something Went Wrong: ${error}`));
			return;
			break;
		case "id":
			if (message.deletable) await message.delete()
				.catch(error => console.log(`Something Went Wrong: ${error}`));
			if (!args[0]) return message.reply(`your Discord member ID is \`${message.author.id}\`!`);
			let idMember = message.mentions.members.first();
			if (!idMember) return message.reply("please enter a valid member of this server.");
			return message.reply(`${idMember.user.tag}'s Discord member ID is \`${idMember.id}\`!`);
			break;
		case "battle":
			if (message.deletable) await message.delete()
				.catch(error => console.log(`Something Went Wrong: ${error}`));
			if (!args || args.length < 2) return message.reply("please enter valid values!");
			let battleWin = args[Math.floor(Math.random() * args.length)];
			return message.reply(`the battle winner is...\n${battleWin}!`);
			break;
		case "coinflip":
			message.channel.send({embed: {
				color: 3447003,
				description: (Math.random() > 0.5) ? 'Heads!' : 'Tails!'
			}});
			if (message.deletable) await message.delete()
				.catch(error => console.log(`Something Went Wrong: ${error}`));
			return;
			break;
	}
	if (
		(message.member &&
		message.member.roles.some(r=>config.moderationGroups.includes(r.name))) ||
		config.admins.includes(message.author.id)
	) {
		switch (command) {
			case "say":
				const sayMsg = args.join(" ");
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!message.member) return message.reply("Sorry, you can only use the \`say\` command from within a guild!");
				await message.channel.send(sayMsg);
				return;
				break;
			case "kick":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!message.member) return message.reply("Sorry, you can only use the \`kick\` command from within a guild!");
				let kickMember = message.mentions.members.first() || message.guild.members.get(args[0]);
				if (!kickMember) return message.reply("please enter a valid member of this server.");
				if (!kickMember.kickable || config.admins.includes(kickMember.user.id)) return message.reply("I do not have permission to kick the specified user.");
				let kickReason = args.slice(1).join(' ');
				if (!kickReason) kickReason = "Unknown.";
				await kickMember.kick(kickReason)
					.catch(error => message.reply("there was an error while kicking a member."));
				message.reply(`${kickMember.user.tag} has been kicked by ${message.author.tag} due to \`${kickReason}\``);
                                if (message.deletable) await message.delete()
                                        .catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
			case "ban":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!message.member) return message.reply("Sorry, you can only use the \`ban\` command from within a guild!");
				let banMember = message.mentions.members.first();
				if (!banMember) return message.reply("please enter a valid member of this server.");
				if (!banMember.bannable || config.admins.includes(banMember.user.id)) return message.reply("I do not have permission to ban the specified user.");
				let banReason = args.slice(1).join(' ');
				if (!banReason) banReason = "Unknown";
				await banMember.ban(banReason)
					.catch(error => message.reply("there was an error while banning a member."));
				message.reply(`${banMember.user.tag} has been banned by ${message.author.tag} due to \`${banReason}\``);
                                if (message.deletable) await message.delete()
                                        .catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
			case "unban":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!message.member) return message.reply("Sorry, you can only use the \`ban\` command from within a guild!");
				if (!message.guild) return message.reply("I can only unban from within a guild!");
				message.guild.unban(args[0])
					.then(user => message.reply(`${user.username} has been unbanned from this guild by ${message.author.tag}!`));
				return;
				break;
			case "purge":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!message.member) return message.reply("Sorry, you can only use the \`purge\` command from within a guild!");
				let msgCount = parseInt(args[0], 10);
				if (!msgCount || msgCount < 1 || msgCount > 100) return message.reply(
					"please provide a valid interger of messages to delete between \`1\` and \`100\`");
				let delMsg = await message.channel.fetchMessages({limit: msgCount});
				message.channel.bulkDelete(delMsg)
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
			case "status":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (args === undefined || args.length != 1) return message.reply("please enter a valid status.");
				client.user.setStatus(args[0]);
				return;
				break;
		}
	}
	if (config.admins.includes(message.author.id)) {
		switch (command) {
			case "relog":
        			client.user.setPresence({game: {name: "Reboot"}, status: "dnd"});
				message.reply(`
					I am now reauthenticating.
					My status has been set to \`Reboot\` until this process is over.
				`)
					.then(msg => client.destroy())
					.then(() => client.login(config.token));
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				return;
				break;
			case "addadmin":
				if (message.deletable) await message.delete()
					.catch(error => console.log(`Something Went Wrong: ${error}`));
				if (!config.owners.includes(message.author.id)) return message.reply("Sorry, only bot owners can use this command!");
				if (!message.member) return message.reply("Sorry, you can only use the \`addadmin\` command from within a guild!");
				let addAdminUser = message.mentions.members.first();
				if (!addAdminUser) return message.reply("please enter a valid member of this server.");
				config.admins.push(addAdminUser.user.id);
				message.reply(`${addAdminUser.user.tag} has been added as a bot admin by ${message.author.tag}!`);
				return;
				break;
                        case "remadmin":
				case "deladmin":
					if (message.deletable) await message.delete()
						.catch(error => console.log(`Something Went Wrong: ${error}`));
					if (!config.owners.includes(message.author.id)) return message.reply("Sorry, only bot owners can use this command!");
					if (!message.member) return message.reply("Sorry, you can only use the \`deladmin\` command from within a guild!");
					let delAdminUser = message.mentions.members.first();
					if (!delAdminUser) return message.reply("please enter a valid member of this server.");
					if (config.owners.includes(delAdminUser.user.id)) return message.reply("I do not have permission to remove privilages from the provided user!");
					config.admins.splice(config.admins.indexOf(delAdminUser.user.id), 1);
					message.reply(`${delAdminUser.user.tag} has had bot admin privilages revoked by ${message.author.tag}!`);
                                	return;
                                	break;
		}
	}
});

client.login(config.token);

