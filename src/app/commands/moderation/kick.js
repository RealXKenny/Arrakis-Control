const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const { hasStaffRole } = require("../../../shared/utils/staffAccess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) => option.setName("user").setDescription("Member to kick.").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the kick.")),
  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) return deny(interaction);
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member?.kickable) return interaction.reply({ content: "That member cannot be kicked.", flags: MessageFlags.Ephemeral });
    await member.kick(interaction.options.getString("reason") ?? `Kicked by ${interaction.user.tag}`);
    await interaction.reply(`Kicked **${user.tag}**.`);
  },
};

function deny(interaction) { return interaction.reply({ content: "You need a configured staff role.", flags: MessageFlags.Ephemeral }); }
