"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const createActorContext_1 = require("../../../shared/utils/createActorContext");
const limits_1 = require("../../../infrastructure/config/limits");
const MINIMUM_OFFLINE_MS = limits_1.BLUEPRINT_LIMITS.minimumOfflineMs;
module.exports = {
    customId: "blueprint-upload-modal",
    async execute(interaction) {
        if (!interaction.client.discordAdapter) {
            throw new Error("Discord Adapter integration is not configured.");
        }
        await interaction.deferReply({
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        const actor = (0, createActorContext_1.createActorContext)(interaction, "blueprint-upload");
        const linked = (await interaction.client.discordAdapter.getCurrentPlayer(actor));
        if (!linked?.linked) {
            await interaction.editReply("You must link a Dune character before uploading a blueprint.");
            return;
        }
        const playerId = linked.pawnId;
        if (!playerId) {
            throw new Error("The linked character did not provide a player pawn ID.");
        }
        const playerList = (await interaction.client.duneApi.call("GET", "/api/players", {
            query: {
                q: linked.characterName ?? "",
                status: "all",
                page: 0,
                pageSize: 50,
            },
        }));
        const profile = findLinkedPlayer(playerList, linked);
        if (!profile) {
            await interaction.editReply("Unable to find your linked character in the Dune Console. Please unlink and link your account again.");
            return;
        }
        if (String(linked.onlineStatus).toLowerCase() ===
            "online" ||
            isOnline(profile)) {
            await interaction.editReply("Your linked character must be offline for at least one minute before uploading a blueprint.");
            return;
        }
        const offlineAt = getOfflineTimestamp(linked, profile);
        if (!offlineAt) {
            await interaction.editReply("Unable to confirm when your character went offline. Please wait and try again.");
            return;
        }
        const elapsed = Date.now() - offlineAt.getTime();
        if (elapsed < MINIMUM_OFFLINE_MS) {
            const remaining = Math.ceil((MINIMUM_OFFLINE_MS - elapsed) / 1000);
            await interaction.editReply(`Your character must remain offline for ${remaining} more second${remaining === 1 ? "" : "s"} before uploading a blueprint.`);
            return;
        }
        const files = interaction.fields.getUploadedFiles("blueprint-file", true);
        if (files.size !== 1) {
            await interaction.editReply("Upload exactly one blueprint JSON file at a time.");
            return;
        }
        const file = files.first();
        if (!file) {
            await interaction.editReply("Unable to read the uploaded blueprint file.");
            return;
        }
        // Let duneApi.importBlueprint() provide its own
        // BlueprintImportResult type.
        const result = await interaction.client.duneApi.importBlueprint(playerId, file);
        await interaction.editReply(result.message ??
            `Blueprint imported for ${linked.characterName ??
                "your linked character"}.`);
        await interaction.client.auditLogger?.blueprintImported(interaction, linked, result, file);
    },
};
function isOnline(profile) {
    const status = profile.status ??
        profile.onlineStatus ??
        profile.online_status ??
        profile.player?.status ??
        profile.player?.onlineStatus;
    return (status === true ||
        String(status).toLowerCase() === "online");
}
function findLinkedPlayer(response, linked) {
    const rows = response &&
        !Array.isArray(response)
        ? response.rows ??
            response.players ??
            response.data ??
            response.results ??
            response.items ??
            []
        : Array.isArray(response)
            ? response
            : [];
    if (!Array.isArray(rows)) {
        return null;
    }
    const linkedName = String(linked.characterName ?? "")
        .trim()
        .toLowerCase();
    const controllerId = String(linked.controllerId ?? "");
    return (rows.find((player) => String(player.player_controller_id ??
        player.playerControllerId ??
        "") === controllerId) ??
        rows.find((player) => String(player.character_name ??
            player.characterName ??
            "")
            .trim()
            .toLowerCase() === linkedName) ??
        null);
}
function getOfflineTimestamp(linked, profile) {
    const values = [
        linked.lastLogoutTime,
        linked.last_logout_time,
        linked.lastOfflineTime,
        linked.last_offline_time,
        profile.lastLogoutTime,
        profile.last_logout_time,
        profile.lastOfflineTime,
        profile.last_offline_time,
        profile.player?.lastLogoutTime,
        profile.player?.last_logout_time,
        profile.last_seen,
        profile.lastSeen,
        profile.updatedAt,
        profile.updated_at,
    ];
    const value = values.find(Boolean);
    if (!value) {
        return null;
    }
    const timestamp = new Date(value);
    return Number.isNaN(timestamp.getTime())
        ? null
        : timestamp;
}
