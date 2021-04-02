const Discord = require('discord.js');
const fs = require('fs');
const os = require('os');
const diffler = require('diffler');
const request = require('request');
const util = require('util');
const splArr = require('split-array');
const d = new Date()

const client = new Discord.Client();
const prefix = '.';

var applying = [];
var memberObj = [];
var inact = "";

function getObj() {
	request(`https://api.wynncraft.com/public_api.php?action=guildStats&command=Empire+of+Sindria`, (err, resp, body) => {
		if (err) client.guilds.cache.get('821545401835585567').channels.cache.get('821545401835585567').send(err);
		if (body) {
			var gu = JSON.parse(body);
			var sorted = gu.members.sort((a, b) => b.contributed - a.contributed);
			memberObj.push(sorted);
			fs.appendFileSync('./member_object.txt', JSON.stringify(memberObj));
		}
	});
}

function addApplying(name, ign, appdate) {
	applying.push(name);
	applicant.push(ign);
	appdate.push(appdate);
}

function addInact(name, time) {
	inact = inact.concat(`${name}:  ${time} days\n`);
}

function clearInact() {
	inact = "";
}

client.on('ready', () => {
	getObj();
	setInterval(getObj, 86400000);
	console.log('Logged in')
})

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	var args = message.content.slice(prefix.length).trim().split(" ");
	var cmd = args.shift().toLowerCase();

	if (cmd == 'inact') {
		clearInact();
		request(`https://api.wynncraft.com/public_api.php?action=guildStats&command=Empire+of+Sindria`, (err, resp, body) => {
			if (err) throw (err);
			var data = JSON.parse(body);
			if (data) {
				//get all the members list
				for (const i in data.members) {
					request(`https://api.wynncraft.com/v2/player/${data.members[i].name}/stats`, (err, resp, body) => {
						if (err) throw (err);
						var data2 = JSON.parse(body);
						if (data2.data[0]) {
							var name = data2.data[0].username;
							var date = Date.parse(data2.data[0].meta.lastJoin);
							//check if they're offline more than 7 days or not
							if ((Date.now() - date) > 604800000) {
								//add spaces after the name to make it more fancy
								for (var i2 = name.length; i2 < 18; i2++) {
									name = name.concat(' ');
								}
								var seen = ((Date.now() - date) / 86400000).toFixed(0);
								addInact(name, seen);
							}
						}
					});
				}
			}
		});
		message.channel.send(`\`\`\`\n${inact}\`\`\``);
	}

	if (cmd == 'xp') {
		// unfinished
		fs.readFile('./member_object.json', 'utf8', function (err, data) {
			if (typeof (args[0] != 'number') || typeof (args[1] != 'number')) {
				return message.channel.send('placeholder')
			}
			else {
				var parsed = JSON.parse(data)
				var firstData = splArr(parsed[args[0]][0], 10);
				var laterData = splArr(parsed[args[1]][0], 10);
				var difflerOut = diffler(firstData, laterData);
				console.log(difflerOut);
			}
		});
	}

	else if (cmd == 'apply' || cmd == 'a') {
		//deleted
	}

	else if (cmd == 'ev' && (message.author.id == 246865469963763713 || message.author.id == 723715951786328080 || message.author.id == 475440146221760512 || message.author.id == 330509305663193091)) {
		//eval
		var cmd = "";
		for (var i = 0; i < args.length; i++) {
			 cmd = cmd.concat(` ${args[i]}`);
		}
		try {
			var out = eval(cmd);
			out = util.inspect(out);
			const Evaluate = new Discord.MessageEmbed()
				.setColor('#ffaa33')
				.setTitle('Evaluate')
				.setDescription(`\`\`\`js\n>${cmd}\n< ${out}\n\`\`\``)
				.setFooter(message.author.username)
				.setTimestamp()
			message.channel.send(Evaluate);
		}
		catch (e) {
			const err = new Discord.MessageEmbed()
				.setColor('#ffaa33')
				.setTitle('Evaluate')
				.setDescription(`\`\`\`js\n>${cmd}\n< ${out}\n\`\`\``)
				.setFooter(message.author.username)
				.setTimestamp()
			message.channel.send(err);
		}
	}			
});