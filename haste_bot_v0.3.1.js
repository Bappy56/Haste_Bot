const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./hasteconfig.json");
const help = require("./hastehelp.json");
const embed = new Discord.RichEmbed();
var pre;

const version = "Bot version: 0.3.1 ***Alpha***";

var afterhours = false;

/*==============================================================================================
Created by Ryan Fitzgerald aka Bappy#0481 in 2017
Using discord.js
Edited with JetBrain's Webstorm
***Script intended for use in Haste Server Bot***
==============================================================================================*/

client.on("ready", () =>
{
    client.user.setGame("with Haste!");
    console.log("Optimizing Server");
})

client.on("message", message =>
{
	if(message.guild.name == "Haste") pre = message.guild.emojis.find("name", "HasteComet").toString().toLowerCase();
	else pre = config.prefix;
	// console.log(message.content);
    var text = message.content.toLowerCase();

    if(!text.startsWith(pre) || message.author.bot) return;
    /*================================================================
    All commands go below this line VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    ==================================================================*/

    //Basic text commands
	if(text.startsWith(pre+" ping")) message.channel.send("Pong! Host Server -> Discord API Service Response Time: `"+(Date.now()-message.createdTimestamp)+" ms`");

    else if(text.startsWith(pre+" price"))
    {
        embed.setTitle("Here's Haste's current prices!");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);
        embed.setURL("https://haste.net/pricing/");

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" support"))
    {
        embed.setTitle("Need help with Haste? Go here!");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);
        embed.setURL("https://support.haste.net/hc/en-us");

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" status"))
    {
        embed.setTitle("Here's the current Haste Server status!");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);
        embed.setURL("http://status.haste.net/");

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" survey"))
    {
        embed.setTitle("Got a game or region you would like to see supported by Haste? Submit it here!");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);
        embed.setURL("https://www.surveymonkey.com/r/HasteGameRegionInterest");

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" regions"))
    {
        embed.setTitle("These are our currently supported games and regions!");
        embed.setURL("https://haste.net/games/");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" need speed"))
    {
        embed.setTitle("Here's how to help reduce your ping!");
        embed.setURL("https://haste.net/2017/09/29/get-close-possible-lan-gaming-online/");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);

        message.channel.send(embed);
    }

    else if(text.startsWith(pre+" commands"))
    {
    	if(message.member.roles.find("name", "Haste Staff") || message.member.roles.find("name", "Community Moderator")) message.channel.send(help.adminCommands+"\nVersion: "+version);
        else message.channel.send(help.commands);
    }

	//Restricted commands (Replace "Testing" with desired role name)
    if(!message.member.roles.find("name", "Haste Staff") && !message.member.roles.find("name", "Community Moderator") || message.channel.id !== message.guild.channels.find("name", "support").id) return;

    else if(text.startsWith(pre+" offline"))
    {
	    afterhours = true;
	    message.react("👋");
	    message.delete(30*100);
    }

    else if(text.startsWith(pre+" online"))
    {
	    afterhours = false;
	    message.react("👍");
	    message.delete(30*100);
    }
})

//Support channel listener (Replace channel ID with target channel's)
client.on("message", message =>
{
	if(message.guild.name == "Haste") pre = message.guild.emojis.find("name", "HasteComet").toString().toLowerCase();
	else pre = config.prefix;
	var text = message.content.toLowerCase();
	const supportChan = message.guild.channels.find("name", "support").id;

	if(message.channel.id !== supportChan || !afterhours || message.author.bot || text.startsWith(pre+" offline")) return;

	else if(message.channel.id === supportChan)
	{
		message.reply(help.afterhours);
	}
})

//Ban event, searches for Audit Log and then redirects to Mod_log
client.on("guildBanAdd", (banGuild, banUser) =>
{
	var banReason;
	const logs = banGuild.channels.find("name", "mod_log");
	if(!logs)
	{
		console.log("Could not find channel.\n"+logs);
		return;
	}

	banGuild.fetchAuditLogs({limit: 1, type: "DELETE"})
		.then((Audits) =>
	{
		var ban = Audits.entries.find("target", banUser);
		console.log(ban);

		if(!ban.reason) banReason = config.noReason;
		else banReason = ban.reason;

		const banEmbed = new Discord.RichEmbed()
		//============================================================
			.setAuthor("Ban Log", client.user.avatarURL)
			.addField("Banned:", ban.target)
			.addField("Reason:", banReason)
			.addField("Responsible Mod:", ban.executor)
			.setFooter("Time: "+ban.createdAt)
			.setColor(config.redColor);
		//============================================================

		logs.send(banEmbed);
	}, (reason) => {console.log("Ban audit logs could not be found because:\n"+reason);})
})

//Will activate on any user leaving, however I've limited it to "MEMBER_KICK"
client.on("guildMemberRemove", (removeUser) =>
{
	var kickReason;
	// console.log(removeUser);
	const logs = removeUser.guild.channels.find("name", "mod_log");
	if(!logs)
	{
		console.log("Could not find channel.\n"+logs);
		return;
	}

	removeUser.guild.fetchAuditLogs({limit: 1, type: "DELETE"})
		.then((Audits) =>
	{
		if(Audits.action !== "MEMBER_KICK") return;
		// console.log(Audits);
		var kick = Audits.entries.find("target", removeUser.user);

		if(!kick.reason) kickReason = config.noReason;
		else kickReason = kick.reason;

		const kickEmbed = new Discord.RichEmbed()
		//===========================================================
			.setAuthor("Kick Log:", client.user.avatarURL)
			.addField("Kicked:", kick.target)
			.addField("Reason:", kickReason)
			.addField("Responsible Mod:", kick.executor)
			.setFooter("Time: "+kick.createdAt)
			.setColor(config.redColor);
		//===========================================================

		logs.send(kickEmbed);
	}, (reason) => {console.log("Kick audit logs could not be found because:\n"+reason);})
})

//Calls on a deleted message
// client.on("messageDelete", (message) =>
// {
// 	// console.log("message");
// 	const logs = message.guild.channels.find("name", "mod_log");
// 	if(!logs)
// 	{
// 		console.log("Could not find channel.\n"+logs);
// 		return;
// 	}
//
// 	message.guild.fetchAuditLogs({limit: 1, type: "DELETE"})
// 		.then((Audits) =>
// 	{
// 		// console.log(Audits);
// 		var deleted = Audits.entries.first();
// 		// if() return;
// 		console.log(deleted);
// 		var msgContent;
// 		console.log("Message author: "+deleted.target+"\nMessage executor: "+deleted.executor);
//
// 		if(!message.content) msgContent = "Please contact "+deleted.executor+" for more details!";
// 		else msgContent = message.content;
//
// 		const deleteEmbed = new Discord.RichEmbed()
// 		//========================================================
// 			.setAuthor("Message Deleted", client.user.avatarURL)
// 			.addField("Message Author:", deleted.target)
// 			.addField("Message Content:", message.content)
// 			.addField("Responsible Mod:", deleted.executor)
// 			.setFooter("Time: "+deleted.createdAt)
// 			.setColor(config.redColor);
// 		//=========================================================
//
// 		logs.send(deleteEmbed);
// 	}, (reason) => {console.log("Delete log rejected because:\n"+reason);})
// })

client.on("error", (e) =>
{
	const errGuild = client.guilds.find("name", "HappyBappy");
	console.error(e);
	errGuild.channels.find("name", "error-log").send("**__Error:__**\n"+e);
})

client.on("warn", (w) =>
{
	const errGuild = client.guilds.find("name", "HappyBappy");
	console.warn(w);
	errGuild.channels.find("name", "error-log").send("**Warning:**\n"+w);
})

/*
client.emojis.find("name", "robot");
 */

client.login(config.token);