const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./hasteconfig.json");
const help = require("./hastehelp.json");
const embed = new Discord.RichEmbed();
var pre;
var sentMsg;

const version = "Bot version: 0.4.4 ***Alpha***";

var afterhours = false;

/*==============================================================================================
Created by Ryan Fitzgerald aka Bappy#0481 in 2017
Using discord.js
Edited with JetBrain's Webstorm
***Script intended for use in Haste Server Bot***
==============================================================================================*/

client.on("ready", () =>
{
    client.user.setActivity("with Haste!", {type: "PLAYING"})
		.then(presence => console.log("Activity resolved!"))
		.catch(console.error);
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
        embed.setTitle("Got a game you would like to see supported by Haste? Submit it here!");
        embed.setAuthor("Haste Auto", client.user.avatarURL);
        embed.setColor(config.color);
        embed.setURL("https://www.surveymonkey.com/r/HasteGameInterest");

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
client.on("message", (message) =>
{
	const errGuild = client.guilds.find("name", "BappyTestingGround");
if(message.guild.name == "Haste") pre = message.guild.emojis.find("name", "HasteComet").toString().toLowerCase();
else pre = config.prefix;
var text = message.content.toLowerCase();
const supportChan = message.guild.channels.find("name", "support").id;
if(message.author.bot && message.channel.id === supportChan)
{
	sentMsg = message.createdTimestamp;
}
if(message.channel.id !== supportChan || !afterhours || message.author.bot || text.startsWith(pre+" offline")) return;
if(!sentMsg) {}
else if((Date.now()-sentMsg) <= 600000) return;
if(message.channel.id === supportChan && !message.member.roles.find("name", "Haste Staff") && !message.member.roles.find("name", "Community Moderator")) message.reply(help.afterhours);
else if(message.member.roles.find("name", "Haste Staff") || message.member.roles.find("name", "Community Moderator")) message.react("❗");
})

//Reaction Event
client.on("messageReactionAdd", (thisReact, reactUser) =>
{
	console.log(reactUser);
if(reactUser.bot) return;
if(thisReact.emoji.name !== "❗") {}
else if(thisReact.message.member.roles.find("name", "Haste Staff") || thisReact.message.member.roles.find("name", "Community Moderator"))
{
	afterhours = false;
	thisReact.message.clearReactions();
	thisReact.message.react("👍")
}
})

//Ban event, searches for Audit Log and then redirects to Mod_log
client.on("guildBanAdd", (banGuild, banUser) =>
{
	const errGuild = client.guilds.find("name", "BappyTestingGround");
	var banReason;
	const logs = banGuild.channels.find("name", "mod_log");
	if(!logs)
	{
		const badLogsEmbed = new Discord.RichEmbed()
		//=========================================================
			.setAuthor("*Console*")
			.addField("Target Channel Object:", "__Begin__\n"+logs+"\n__End__");
		//=========================================================
		errGuild.channels.find("name", "error-log").send("**__No Ban Channel__**\nCould not find channel.\nLine 159\n"+badLogsEmbed);
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
	}, (reason) =>
	{
		errGuild.channels.find("name", "error-log").send("Ban audit logs could not be found because:\n"+reason);
		console.log("Ban audit logs could not be found because:\n"+reason);
	})
})

//Will activate on any user leaving, however I've limited it to "MEMBER_KICK"
client.on("guildMemberRemove", (removeUser) =>
{
	const errGuild = client.guilds.find("name", "BappyTestingGround");
	var kickReason;
	// console.log(removeUser);
	const logs = removeUser.guild.channels.find("name", "mod_log");
	if(!logs)
	{
		const badLogsEmbed = new Discord.RichEmbed()
		//=========================================================
			.setAuthor("*Console*")
			.addField("Target Channel Object:", "__Begin__\n"+logs+"\n__End__")
			.setColor(0, 0, 0);
		//=========================================================
		errGuild.channels.find("name", "error-log").send("**__No Kick Channel__**\nCould not find channel.\nLine 204\n"+badLogsEmbed);
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
	}, (reason) =>
	{
		errGuild.channels.find("name", "error-log").send("Kick audit logs could not be found because:\n"+reason);
		console.log("Ban audit logs could not be found because:\n"+reason);
	})
})

client.on("error", (e) =>
{
	const errGuild = client.guilds.find("name", "BappyTestingGround");
	console.error(e);
	errGuild.channels.find("name", "error-logs").send("**__Error:__**\n"+e);
})

client.on("warn", (w) =>
{
	const errGuild = client.guilds.find("name", "BappyTestingGround");
	console.warn(w);
	errGuild.channels.find("name", "error-logs").send("**Warning:**\n"+w);
})

client.on("debug", (d) =>
{
    console.log("Debugger:\n"+d);
	errGuild = client.guilds.find("name", "BappyTestingGround");
	// console.log("Errguild: "+errGuild);
	if(errGuild === null) return;
	// console.log(errGuild);
	errGuild.channels.find("name", "error-logs").send("***Debugger:***\n"+d);
})

/*
 */

client.login(config.token);