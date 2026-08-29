const { MessageFlags } = require("discord.js");
const { verifyCaptcha } = require("../../../shared/utils/captchaStore");

module.exports = {
  customId: "member-captcha-modal",

  async execute(interaction) {
    const answer = interaction.fields.getTextInputValue("captcha-answer");
    if (!verifyCaptcha(interaction.user.id, answer)) {
      await interaction.reply({ content: "Captcha incorrect or expired. Try again.", flags: MessageFlags.Ephemeral });
      return;
    }
    const roleId = process.env.VERIFIED_MEMBER_ROLE_ID;
    if (roleId && interaction.member?.roles) {
      await interaction.member.roles.add(roleId, "Completed membership captcha");
    }
    await interaction.reply({ content: "Verification complete. Welcome to Arrakis!", flags: MessageFlags.Ephemeral });
  },
};
