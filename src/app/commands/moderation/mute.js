const { SlashCommandBuilder } = require("discord.js");
const timeout = require("./timeout");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member using a timeout.")
    .addUserOption((option) => option.setName("user").setDescription("Member to mute.").setRequired(true))
    .addIntegerOption((option) => option.setName("minutes").setDescription("Mute duration in minutes.").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the mute.")),
  execute: timeout.execute,
};
