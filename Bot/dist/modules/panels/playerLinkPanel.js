"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePlayerLinkPanel = ensurePlayerLinkPanel;
const discord_js_1 = require("discord.js");
const canvas_1 = require("canvas");
const logger_1 = require("../../infrastructure/core/logger");
const findPanelMessage_1 = require("../../shared/utils/findPanelMessage");
const logger = (0, logger_1.createLogger)("PLAYER PANEL");
const PANEL_MARKER = "# Link Account";
const PANEL_IMAGE_NAME = "dune-player-link.png";
function buildPlayerLinkPanel() {
    return new discord_js_1.ContainerBuilder()
        .setAccentColor(0xc58b45)
        .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder()
        .setURL(`attachment://${PANEL_IMAGE_NAME}`)
        .setDescription("Dune desert landscape for character linking")))
        .addTextDisplayComponents((text) => text.setContent(PANEL_MARKER))
        .addTextDisplayComponents((text) => text.setContent("Link your Discord account to your Dune account.\n\nYou must be online before you can receive a verification code."))
        .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.setComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("player-link")
        .setLabel("Link Account")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId("player-unlink")
        .setLabel("Unlink Account")
        .setStyle(discord_js_1.ButtonStyle.Danger)));
}
async function ensurePlayerLinkPanel(client, channelId) {
    if (!channelId) {
        return;
    }
    if (!client.user) {
        throw new Error("Cannot create player link panel before the Discord client is ready.");
    }
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isSendable()) {
        throw new Error(`Panel channel ${channelId} is not a sendable channel.`);
    }
    const existingPanel = await (0, findPanelMessage_1.findPanelMessage)(channel, client.user.id, PANEL_MARKER);
    const panel = buildPlayerLinkPanel();
    const banner = createPlayerLinkBanner();
    if (existingPanel) {
        const editPayload = {
            content: null,
            embeds: [],
            components: [panel],
            files: [banner],
        };
        await existingPanel.edit(editPayload);
        logger.info(`Updated the player link panel in channel ${channelId}.`);
        return;
    }
    const payload = {
        components: [panel],
        files: [banner],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    };
    await channel.send(payload);
    logger.info(`Posted player link panel in channel ${channelId}.`);
}
function createPlayerLinkBanner() {
    const canvas = (0, canvas_1.createCanvas)(1200, 400);
    const context = canvas.getContext("2d");
    const background = context.createLinearGradient(0, 0, 0, canvas.height);
    background.addColorStop(0, "#1c1009");
    background.addColorStop(0.52, "#77401f");
    background.addColorStop(1, "#d2a85a");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawDunes(context, canvas);
    const shade = context.createLinearGradient(0, 0, canvas.width, 0);
    shade.addColorStop(0, "rgba(8, 5, 3, 0.88)");
    shade.addColorStop(0.62, "rgba(8, 5, 3, 0.25)");
    shade.addColorStop(1, "rgba(8, 5, 3, 0)");
    context.fillStyle = shade;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f3d39b";
    context.font =
        "bold 52px sans-serif";
    context.fillText("LINK ACCOUNT", 64, 110);
    context.fillStyle = "#e6bd79";
    context.font =
        "24px sans-serif";
    context.fillText("CONNECT YOUR ACCOUNT", 67, 153);
    context.strokeStyle = "#c58b45";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(67, 178);
    context.lineTo(610, 178);
    context.stroke();
    context.fillStyle = "#ead5ad";
    context.font =
        "22px sans-serif";
    context.fillText("Your path through Arrakis begins here.", 67, 232);
    context.font =
        "18px sans-serif";
    context.fillStyle = "#d8bb83";
    context.fillText("A private verification code will be delivered in-game.", 67, 345);
    return new discord_js_1.AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: PANEL_IMAGE_NAME,
    });
}
function drawDunes(context, canvas) {
    const dunes = [
        {
            y: 270,
            height: 70,
            color: "#743a1b",
            offset: 0,
        },
        {
            y: 315,
            height: 60,
            color: "#9a592e",
            offset: 150,
        },
        {
            y: 350,
            height: 45,
            color: "#b87333",
            offset: 300,
        },
        {
            y: 376,
            height: 30,
            color: "#d2a85a",
            offset: 500,
        },
    ];
    for (const { y, height, color, offset, } of dunes) {
        context.beginPath();
        context.moveTo(0, canvas.height);
        context.lineTo(0, y);
        for (let x = 0; x <= canvas.width; x += 20) {
            const wave = Math.sin((x + offset) / 130) *
                height *
                0.25 +
                Math.sin((x + offset) / 270) *
                    height *
                    0.2;
            context.lineTo(x, y + wave);
        }
        context.lineTo(canvas.width, canvas.height);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }
}
