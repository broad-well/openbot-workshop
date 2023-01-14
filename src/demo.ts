// A demo of all the reference sheet features
import { ApplicationCommandType, Events, GatewayIntentBits } from 'discord.js'
import host from './host'

const mod = host.module('demo', [
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages
])
let totalCount = 0

// Event handler: when this happens, do that
mod.when(Events.MessageCreate, async evt => {
  ++totalCount
  if (evt.cleanContent.startsWith('s'))
    await evt.react('✨')
})

// Slash commands: simple (no options, no check)
mod.slash('demo-members', 'Have the demo bot list all the members in this guild', async intx => {
  // Fetch all guild members
  const members = await intx.guild?.members.fetch()
  if (members !== undefined) {
    return Array.from(members.values()).map(member => member.nickname ?? member.user.username).join(', ')
  } else {
    return 'Not possible :('
  }
})

// Slash commands: complete (some options, check possible)
mod.slash('demo-divide', 'Let the bot perform a division', {
  build: builder => builder
      .addNumberOption(opt =>
        opt.setName('divisor')
          .setDescription('The divisor of the division, as in a in a/b')
          .setRequired(true))
      .addNumberOption(opt =>
        opt.setName('dividend')
          .setDescription('The dividend of the division, as in b in a/b')
          .setRequired(true)),

  check(intx) {
    if (intx.options.getNumber('dividend', true) === 0) {
      throw new Error('You cannot divide by zero!')
    }
  },
  run(intx) {
    const quotient = intx.options.getNumber('divisor', true) / intx.options.getNumber('dividend', true)
    return quotient.toString()
  }
})

// Context menu commands: right click on a message and select "Repeat"
mod.menu('Repeat', ApplicationCommandType.Message, async intx => {
  await intx.reply(`>>> ${intx.targetMessage.content}`)
})

// Context menu commands: right click on a user and select "Send total count"
mod.menu('Send total count', ApplicationCommandType.User, async intx => {
  await intx.user.send(totalCount.toString())
  await intx.reply({content: 'done!', ephemeral: true})
})
