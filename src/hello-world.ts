import { Events, GatewayIntentBits, userMention } from 'discord.js'
import host from './host'

const mod = host.module('ExampleHelloWorld', [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages])

mod.when(Events.MessageCreate, async msg => {
  if (msg.cleanContent === 'hello bot') {
    await msg.reply(`hello ${userMention(msg.author.id)}`)
  }
})
