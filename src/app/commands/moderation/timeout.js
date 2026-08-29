const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const { hasStaffRole } = require("../../../shared/utils/staffAccess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .addUserOption((option) => option.setName("user").setDescription("Member to timeout.").setRequired(true))
    .addIntegerOption((option) => option.setName("minutes").setDescription("Timeout duration in minutes.").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the timeout.")),
  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) return deny(interaction);
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member?.moderatable) return interaction.reply({ content: "That member cannot be timed out.", flags: MessageFlags.Ephemeral });
    const minutes = interaction.options.getInteger("minutes", true);
    await member.timeout(minutes * 60_000, interaction.options.getString("reason") ?? `Timed out by ${interaction.user.tag}`);
    await interaction.reply(`Timed out **${user.tag}** for ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  },
};

function deny(interaction) { return interaction.reply({ content: "You need a configured staff role.", flags: MessageFlags.Ephemeral }); }
