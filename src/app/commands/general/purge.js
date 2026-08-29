const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete recent messages from this channel.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    if (!hasStaffRole(interaction)) {
      await interaction.reply({
        content: "You need a configured staff role to use this command.",
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);

    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.editReply(
      `Deleted ${deleted.size} recent message${deleted.size === 1 ? "" : "s"}.`,
    );
  },
};

function hasStaffRole(interaction) {
  const staffRoleIds = [
    "TRIAL_STAFF_ROLE_ID",
    "MODERATOR_ROLE_ID",
    "SENIOR_MODERATOR_ROLE_ID",
    "ADMINISTRATOR_ROLE_ID",
    "HEAD_ADMINISTRATOR_ROLE_ID",
    "OWNER_ROLE_ID",
  ]
    .map((name) => process.env[name])
    .filter(Boolean);

  return staffRoleIds.some((roleId) => interaction.member.roles.cache.has(roleId));
}
