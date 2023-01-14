// A demo of all the reference sheet features

import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, Events, GatewayIntentBits, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
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
  if (evt.cleanContent.startsWith('s')) {
    await evt.react('✨')
  }
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

  check (intx) {
    if (intx.options.getNumber('dividend', true) === 0) {
      throw new Error('You cannot divide by zero!')
    }
  },
  run (intx) {
    const quotient = intx.options.getNumber('divisor', true) / intx.options.getNumber('dividend', true)
    return quotient.toString()
  }
})

// Context menu commands: right click on a message and select "Repeat"
mod.menu('Repeat', ApplicationCommandType.Message, async intx => {
  // Reply (everyone in the channel can see)
  await intx.reply(`>>> ${intx.targetMessage.content}`)
})

// Context menu commands: right click on a user and select "Send total count"
mod.menu('Send total count', ApplicationCommandType.User, async intx => {
  // DM a user
  await intx.targetUser.send(totalCount.toString())
  // Reply (only the user can see)
  await intx.reply({ content: 'done!', ephemeral: true })
})

mod.menu('Give 2021-2022 role', ApplicationCommandType.User, {
  async check (intx) {
    const oldInLap = ['135824500603224064', '304419040703545344', '112742149145006080']
    if (!oldInLap.includes(intx.targetId)) {
      throw new Error('The user was not in LAE during 2021-2022!')
    }
    if (!intx.inGuild()) {
      throw new Error('The interaction must take place in a server!')
    }
    return intx
  },
  async run (_generic, intx) {
    if (intx !== undefined) {
      // Add roles
      const member = await intx.guild?.members.fetch(intx.targetId)
      await member?.roles.add('1028749978870493234')
      await intx.reply({ content: 'done!', ephemeral: true })
    }
  }
})

// Display embeds and buttons
mod.slash('demo-count', 'Display the number of messages caught in a fancy format', async intx => {
  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('count-good')
        .setLabel('Good')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId('count-bad')
        .setLabel('Bad')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎'))
  // You can also return the reply
  return {
    embeds: [{
      title: `The total count: ${totalCount}`,
      description: 'This is a sample description',
      fields: [
        {
          name: 'Field',
          value: 'Achieved'
        }
      ]
    }],
    components: [buttons]
  }
})

// Respond to button clicks
mod.when(Events.InteractionCreate, async intx => {
  if (intx.isMessageComponent()) {
    if (intx.customId === 'count-good') {
      await intx.reply({ content: 'glad you like the count :)', ephemeral: true })
    } else if (intx.customId === 'count-bad') {
      // Construct and show modals
      const modal = new ModalBuilder()
        .setCustomId('count-bad-form')
        .setTitle('Count Bad Form')
        .addComponents(
          new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(new TextInputBuilder()
              .setCustomId('count-bad-reason')
              .setLabel('Why don\'t you like this number?')
              .setMinLength(10)
              .setMaxLength(200)
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)))
      await intx.showModal(modal)
    }
  }
  // Handle modal submission
  if (intx.isModalSubmit() && intx.customId === 'count-bad-form') {
    console.log(intx.fields.getTextInputValue('count-bad-reason'))
    await intx.reply({ content: 'thanks for your feedback', ephemeral: true })
  }
})
