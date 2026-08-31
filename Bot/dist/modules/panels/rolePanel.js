"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRolePanel = ensureRolePanel;
const discord_js_1 = require("discord.js");
const imageFactory_1 = require("../../shared/factories/imageFactory");
const selfAssignableRoles_1 = require("../../shared/constants/selfAssignableRoles");
const findPanelMessage_1 = require("../../shared/utils/findPanelMessage");
const PANEL_MARKER = "## Choose Your Arrakis Roles";
const PANEL_IMAGE_NAME = "role-selection.png";
async function ensureRolePanel(client, channelId) {
    if (!channelId) {
        return;
    }
    if (!client.user) {
        throw new Error("Cannot create role panel before the Discord client is ready.");
    }
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isSendable()) {
        throw new Error(`Role panel channel ${channelId} is not a sendable channel.`);
    }
    const roleOptions = getRoleOptions();
    if (roleOptions.length === 0) {
        throw new Error("No self-assignable roles are configured.");
    }
    const roleContainer = new discord_js_1.ContainerBuilder()
        .setAccentColor(0xc58b45)
        .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder()
        .setURL(`attachment://${PANEL_IMAGE_NAME}`)
        .setDescription("Arrakis role selection banner")))
        .addTextDisplayComponents((text) => text.setContent(PANEL_MARKER))
        .addTextDisplayComponents((text) => text.setContent("Select your playstyle, faction, and notification roles below. Your selections are updated automatically."))
        .addActionRowComponents((row) => row.setComponents(new discord_js_1.StringSelectMenuBuilder()
        .setCustomId("self-assignable-roles")
        .setPlaceholder("Choose your roles")
        .setMinValues(0)
        .setMaxValues(Math.min(roleOptions.length, 10))
        .addOptions(roleOptions)));
    const existingPanel = await (0, findPanelMessage_1.findPanelMessage)(channel, client.user.id, PANEL_MARKER);
    if (existingPanel) {
        const banner = (0, imageFactory_1.createDuneBanner)({
            filename: PANEL_IMAGE_NAME,
            title: "Choose Roles",
            subtitle: "COMMUNITY ROLES",
            detail: "PLAYSTYLE • FACTIONS • NOTIFICATIONS",
        });
        await existingPanel.edit({
            content: null,
            embeds: [],
            components: [roleContainer],
            files: [
                {
                    attachment: banner.attachment,
                    name: PANEL_IMAGE_NAME,
                },
            ],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        return;
    }
    const banner = (0, imageFactory_1.createDuneBanner)({
        filename: PANEL_IMAGE_NAME,
        title: "Choose Roles",
        subtitle: "COMMUNITY ROLES",
        detail: "PLAYSTYLE • FACTIONS • NOTIFICATIONS",
    });
    await channel.send({
        components: [roleContainer],
        files: [banner],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
}
function getRoleOptions() {
    return (0, selfAssignableRoles_1.getConfiguredRoleOptions)().map(({ label, description, value }) => ({
        label,
        description,
        value,
    }));
}
