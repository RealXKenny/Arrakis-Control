const { ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { createCaptcha } = require("../../../shared/utils/captchaStore");

module.exports = {
  customId: "member-captcha",

  async execute(interaction) {
    const code = createCaptcha(interaction.user.id);
    const modal = new ModalBuilder()
      .setCustomId("member-captcha-modal")
      .setTitle("Membership Verification")
      .addLabelComponents((label) =>
        label.setLabel(`Enter this code: ${code}`).setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("captcha-answer")
            .setStyle(TextInputStyle.Short)
            .setRequired(true),
        ),
      );
    await interaction.showModal(modal);
  },
};
