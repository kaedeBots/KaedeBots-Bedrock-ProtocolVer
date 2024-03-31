console.log('kaede鯖Realms連携Bot')
const { v4: uuidv4 } = require('uuid');
const { Guild, Client, GatewayIntentBits, Partials, Events, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, ActivityType  } = require('discord.js');
const discord = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
	],
});


const config = require('./config.js')
let players = []

const bedrock = require('bedrock-protocol')
const client = bedrock.createClient({
  realms: {
    realmInvite: config.realm_invite_code
  },
	username: config.gamertag
})

discord.once("ready", async () => {
	discord.user.setPresence({
		activities: [{ name: `のチャットを`, type: ActivityType.Watching }],
		status: 'dnd',
	  });
});


// We can listen for text packets. See proto.yml for documentation.
client.on('text', (packet) => {
	//console.log(packet)
	if (packet.type == "translation") {
        if (packet.message.match(/§e%multiplayer.player.joined/)) {
            discord.channels.cache.get(config.discord_channel_main).send({
                embeds: [{
                    title: `${packet.parameters[0]} がRealmにやってきました`,
                    color: 0x00FF00
                }]
            });
        }
        if (packet.message.match(/§e%multiplayer.player.left/)) {
            discord.channels.cache.get(config.discord_channel_main).send({
                embeds: [{
                    title: `${packet.parameters[0]} がRealmを去りました`,
                    color: 0xFF0000
                }]
            });
        }
    }
	if (packet.type == "json_whisper" || packet.type == "json") {
		console.log(JSON.stringify(packet));
		json = JSON.parse(packet.message)
		//console.log(json)
		console.log("§r");
		let rawText=json.rawtext.map(a=>a.text).join("");
		let text="";
		for(let i=0;i<rawText.length;i++){
		  if(rawText[i]=="§"){
			i++;
			continue;
		  }
		  text+=rawText[i];
		}
		// if(text.startsWith("☠") || text.startsWith("禁止区域")) return; // 禁止区域のログなどを非表示にするコード
		// 禁止区域の開始通知とキルログとかを分けるコード
		if (text.match(/^(☠|禁止区域|制限時間)/)) return discord.channels.cache.get(config.discord_channel_notice).send(text);
		if (text.match(/^(((ULTIMATE )?(CRAZY )?(RARE )?(ARMOR )?(SWORD )?(COIN )?(DROP))|追加ボーナス)/)) return discord.channels.cache.get(config.discord_channel_rare).send(text);
		else discord.channels.cache.get(config.discord_channel_main).send(text);
	}
	if (packet.type == "chat") {
		discord.channels.cache.get(config.discord_channel).send(`<${packet.source_name.replace(/§./g, '')}> ${packet.message.replace(/§./g, '')}`)
	}
})

client.on('player_list', (data) => {
	if (data.records.type === "add") {
	  for (record of data.records.records) {
		if(players.some(player => player.name === record.username)) continue
		players.push({name: record.username, id: record.uuid})      
	  }
	}
	
	if (data.records.type === "remove") {
	  for (record of data.records.records) {
		for (let i = 0; i < players.length; i++) {
		  if (players[i].id === record.uuid) {
			players.splice(i, 1);
			break;
		  }
		}  
	  }
	}
  })

discord.on("messageCreate", (message) => {  
  if (message.author.bot) return;
	if (message.mentions.users.first()) {
		if (message.mentions.users.first().id == discord.user.id) {
			message.reply("何だよ")
			return
		}
	}

	if (message.content.match(/^.cmd /)) {
		if (message.member.roles.cache.has(config.op_role)) {
			let commandline = message.content.replace(".cmd ", "");
			client.queue('command_request', {
				command: commandline,
				origin: {
					type: "player",
					uuid: uuidv4(),
					request_id: uuidv4()
				},
				version: 52
			})
			
			message.reply("コマンドを送信しました")
		} else {
			message.reply("お前権限持ってないでしょコマンド送信しようとするな")
		}
		return
	}
	if (message.content.match(/^.list/)) {
		let nameList = []
		for (let i = 0; i < players.length; i++) {
		  nameList.push(players[i].name);
		}
		message.reply(nameList.sort().join('\n'))
		return
		}
	if (message.content === ".ping") {
			message.reply(`Pong! 🏓\n応答速度： ${discord.ws.ping}ms`)
			return
		  }
	
	if (message.content === ".mee6sine") { // ここらへんはネタ機能
		message.reply('ふざけてんじゃねえぞボケナスが\n覚えてろよぶち殺してやるからな:thinking:')
		return
	}
	if (message.content === ".mainnki") {
		message.reply('ためろっっっwww')
		return
	}
	if (message.content === ".gpt") {
		message.reply('くっそおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおおお\nThis message reached the length limit, and was not fully generated.')
		return
	}
	if (message.content === ".help") { // ここはネタじゃない(ヘルプ関連)
		message.reply('## このBotで実行できるコマンド\n- `.cmd` 特別な権限を持った人がBot経由でサーバーにコマンドを送信できます\n- `.list` プレイヤーリストを表示します\n- `.ping` BotからDiscordWebsocketまでの遅延を送信します')
	}
	if (message.content === ".pig") { // またもやネタ機能
		message.reply('***もしかして:*** `.ping`')
	}
	if (message.content === ".mainki") {
		message.reply('***もしかして:*** `.mainnki`')
	}


	if (message.channel.id === config.discord_channel_main) {
		client.queue('command_request', {
		  command: `tellraw @a[rm=0.001] ${JSON.stringify({rawtext:[{text:`<${message.author.username} [§9§lDISCORD§r]> ${message.content}`}]})}`,
		  origin: {
			type: "player",
			uuid: uuidv4(),
			request_id: uuidv4()
		  },
		  version: 52
		})
	  }
	return
});


discord.login(config.discord_token);