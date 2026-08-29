const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const { hasStaffRole } = require("../../../shared/utils/staffAccess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .addUserOption((option) => option.setName("user").setDescription("Member to ban.").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the ban.")),
  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) return deny(interaction);
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member?.bannable) return interaction.reply({ content: "That member cannot be banned.", flags: MessageFlags.Ephemeral });
    await member.ban({ reason: interaction.options.getString("reason") ?? `Banned by ${interaction.user.tag}` });
    await interaction.reply(`Banned **${user.tag}**.`);
  },
};

function deny(interaction) { return interaction.reply({ content: "You need a configured staff role.", flags: MessageFlags.Ephemeral }); }
