"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
module.exports = {
    name: discord_js_1.Events.GuildMemberAdd,
    async execute(member) {
        const auditLogger = member.client.auditLogger;
        if (auditLogger) {
            await auditLogger.sendTo(auditLogger.activityChannelId, "Member joined", [
                `**User:** ${member.user.tag} (${member.id})`,
                `**Guild:** ${member.guild.name}`,
            ]);
        }
        const channelId = process.env.WELCOME_CHANNEL_ID;
        if (!channelId)
            return;
        const channel = await member.guild.channels.fetch(channelId);
        if (!channel?.isTextBased())
            return;
        const banner = await (0, imageFactory_1.createMemberBanner)({
            filename: "member-welcome.png",
            title: "Welcome",
            member,
        });
        const container = (0, componentFactory_1.createContainer)({
            title: "## Welcome to Arrakis!",
            body: `Welcome ${member} to **${member.guild.name}**.\n\n` +
                "Prepare yourself for the spice and watch the sands carefully.",
            color: 0xc58b45,
        }).addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL("attachment://member-welcome.png")));
        const response = (0, componentFactory_1.createV2Response)([container], [banner]);
        await channel.send({
            components: response.components,
            files: response.files,
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: {
                users: [member.id],
            },
        });
    },
};
