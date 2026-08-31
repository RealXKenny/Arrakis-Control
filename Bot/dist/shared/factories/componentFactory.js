"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainer = createContainer;
exports.createV2Response = createV2Response;
const discord_js_1 = require("discord.js");
function createContainer({ title, body, color = 0xc58b45, children = [], }) {
    const container = new discord_js_1.ContainerBuilder()
        .setAccentColor(color);
    if (title) {
        container.addTextDisplayComponents((text) => text.setContent(title));
    }
    if (body) {
        container.addTextDisplayComponents((text) => text.setContent(body));
    }
    if (children.length) {
        container.addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small));
    }
    for (const child of children) {
        child(container);
    }
    return container;
}
function createV2Response(components, files = []) {
    return {
        components,
        files,
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    };
}
