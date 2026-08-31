"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPanelMessage = findPanelMessage;
async function findPanelMessage(channel, botUserId, marker) {
    const messages = await channel.messages.fetch({ limit: 50 });
    return (messages.find((message) => message.author.id === botUserId &&
        containsText(message.components, marker)) ?? null);
}
function containsText(components, marker) {
    return components.some((component) => {
        if (!component || typeof component !== "object") {
            return false;
        }
        const item = component;
        const content = typeof item.content === "string"
            ? item.content
            : typeof item.data?.content === "string"
                ? item.data.content
                : undefined;
        if (content?.includes(marker)) {
            return true;
        }
        return (Array.isArray(item.components) &&
            containsText(item.components, marker));
    });
}
