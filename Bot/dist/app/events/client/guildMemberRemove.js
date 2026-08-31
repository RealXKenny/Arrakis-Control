"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
module.exports = {
    name: discord_js_1.Events.GuildMemberRemove,
    async execute(member) {
        await member.client.auditLogger?.sendTo(member.client.auditLogger.activityChannelId, "Member left", [
            `**User:** ${member.user.tag} (${member.id})`,
            `**Guild:** ${member.guild.name}`,
        ]);
        const channelId = process.env.GOODBYE_CHANNEL_ID;
        if (!channelId)
            return;
        const channel = await member.guild.channels.fetch(channelId);
        if (!channel?.isTextBased())
            return;
        const banner = await (0, imageFactory_1.createMemberBanner)({
            filename: "member-goodbye.png",
            title: "Goodbye",
            member,
        });
        const container = (0, componentFactory_1.createContainer)({
            title: "## A Traveler Has Departed",
            body: `**${member.user.tag}** has left **${member.guild.name}**.\n\nMay the winds of Arrakis guide their journey.`,
            color: 0xc58b45,
        }).addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL("attachment://member-goodbye.png")));
        const response = (0, componentFactory_1.createV2Response)([container], [banner]);
        await channel.send({
            components: response.components,
            files: response.files,
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
    },
};
