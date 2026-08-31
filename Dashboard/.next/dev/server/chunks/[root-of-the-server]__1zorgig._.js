module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[project]/dashboard/app/api/dune/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDuneClient",
    ()=>getDuneClient
]);
const { DuneConsoleClient } = __turbopack_context__.r("[project]/infrastructure/api/core/DuneConsoleClient.js [app-route] (ecmascript)");
function getDuneClient() {
    if (!process.env.CONSOLE_URL) {
        throw new Error('CONSOLE_URL is not configured');
    }
    if (!/*TURBOPACK member replacement*/ __turbopack_context__.g.duneConsoleClientInstance) {
        /*TURBOPACK member replacement*/ __turbopack_context__.g.duneConsoleClientInstance = new DuneConsoleClient(process.env.CONSOLE_URL);
        /*TURBOPACK member replacement*/ __turbopack_context__.g.duneConsoleClientInstance.login(process.env.CONSOLE_PASSWORD).catch(()=>{});
    }
    return /*TURBOPACK member replacement*/ __turbopack_context__.g.duneConsoleClientInstance;
}
;
}),
"[project]/dashboard/app/api/player/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$api$2f$dune$2f$route$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/app/api/dune/route.js [app-route] (ecmascript)");
;
;
;
const dynamic = 'force-dynamic';
const revalidate = 0;
/**
 * Helpers
 */ function firstNumber(...values) {
    for (const value of values){
        const number = Number(value);
        if (Number.isFinite(number)) {
            return number;
        }
    }
    return null;
}
function firstValue(...values) {
    for (const value of values){
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return null;
}
function clampPercent(value) {
    if (!Number.isFinite(value)) {
        return null;
    }
    return Math.max(0, Math.min(100, value));
}
/**
 * Normalize currency.
 */ function normalizeCurrency(currency) {
    if (!currency) {
        return {
            available: false,
            rows: [],
            solariCredit: null,
            scrip: null
        };
    }
    const rows = Array.isArray(currency) ? currency : Array.isArray(currency.rows) ? currency.rows : Array.isArray(currency.data) ? currency.data : [];
    const normalizedRows = rows.map((row)=>({
            ...row,
            currency_id: firstNumber(row?.currency_id, row?.currencyId, row?.id),
            balance: firstNumber(row?.balance) ?? 0,
            label: row?.label ?? null
        }));
    const solariRow = normalizedRows.find((row)=>{
        const label = String(row.label ?? '').toLowerCase();
        return label.includes('solari') || label.includes('solar');
    });
    const scripRow = normalizedRows.find((row)=>{
        const label = String(row.label ?? '').toLowerCase();
        return label.includes('scrip');
    });
    return {
        ...currency,
        available: currency?.capabilities?.currency === true || normalizedRows.length > 0,
        rows: normalizedRows,
        // Convenient values for the frontend.
        solariCredit: solariRow?.balance ?? null,
        scrip: scripRow?.balance ?? null,
        // Keep the original API naming available too.
        solarisCoin: solariRow?.balance ?? null
    };
}
/**
 * Extract base ID.
 */ function getBaseId(base) {
    return firstValue(base?.base_id, base?.baseId, base?.id, base?.uuid);
}
/**
 * Normalize base inventory storage.
 */ function normalizeBaseStorage(inventory) {
    if (!inventory) {
        return {
            available: false,
            used: null,
            max: null,
            percent: null
        };
    }
    const directUsed = firstNumber(inventory.used, inventory.usedStorage, inventory.storageUsed, inventory.totalUsed, inventory.usedSlots, inventory.occupied, inventory.current);
    const directMax = firstNumber(inventory.max, inventory.maxStorage, inventory.storageMax, inventory.storageCapacity, inventory.capacity, inventory.maxCapacity, inventory.totalCapacity, inventory.slots, inventory.maxSlots);
    const storage = inventory.storage || {};
    const storageUsed = firstNumber(directUsed, storage.used, storage.usedStorage, storage.storageUsed, storage.current, storage.occupied);
    const storageMax = firstNumber(directMax, storage.max, storage.maxStorage, storage.storageMax, storage.capacity, storage.maxCapacity, storage.totalCapacity, storage.slots, storage.maxSlots);
    const containers = Array.isArray(inventory.containers) ? inventory.containers : Array.isArray(inventory.rows) ? inventory.rows : Array.isArray(inventory.data) ? inventory.data : [];
    let containerUsed = null;
    let containerMax = null;
    for (const container of containers){
        const type = String(container?.type || container?.containerType || container?.category || '').toLowerCase();
        const isStorage = type.includes('storage') || type.includes('inventory');
        if (!isStorage) {
            continue;
        }
        const used = firstNumber(container?.used, container?.usedSlots, container?.occupied, container?.current, container?.itemCount);
        const max = firstNumber(container?.max, container?.maxSlots, container?.capacity, container?.slots, container?.maxCapacity);
        if (used !== null) {
            containerUsed = (containerUsed ?? 0) + used;
        }
        if (max !== null) {
            containerMax = (containerMax ?? 0) + max;
        }
    }
    const used = storageUsed !== null ? storageUsed : containerUsed;
    const max = storageMax !== null ? storageMax : containerMax;
    let percent = null;
    if (used !== null && max !== null && max > 0) {
        percent = clampPercent(used / max * 100);
    }
    if (percent === null) {
        const suppliedPercent = firstNumber(inventory.percent, inventory.fillPercent, inventory.storagePercent, inventory.usedPercent, storage.percent, storage.fillPercent, storage.usedPercent);
        if (suppliedPercent !== null) {
            percent = clampPercent(suppliedPercent > 1 ? suppliedPercent : suppliedPercent * 100);
        }
    }
    return {
        available: used !== null || max !== null || percent !== null,
        used,
        max,
        percent
    };
}
/**
 * Normalize water.
 */ function normalizeBaseWater(water) {
    if (!water) {
        return {
            available: false,
            containers: 0,
            volume: null,
            maxVolume: null,
            percent: null,
            bloodVolume: null,
            bloodMaxVolume: null,
            bloodPercent: null
        };
    }
    const containers = Array.isArray(water) ? water : Array.isArray(water?.containers) ? water.containers : Array.isArray(water?.rows) ? water.rows : Array.isArray(water?.data) ? water.data : [];
    const directVolume = firstNumber(water.volume, water.currentVolume, water.totalVolume, water.waterVolume);
    const directMaxVolume = firstNumber(water.maxVolume, water.capacity, water.maxCapacity, water.totalCapacity);
    let volume = directVolume;
    let maxVolume = directMaxVolume;
    let bloodVolume = firstNumber(water.bloodVolume, water.currentBloodVolume);
    let bloodMaxVolume = firstNumber(water.bloodMaxVolume, water.bloodCapacity, water.maxBloodVolume);
    if (containers.length > 0) {
        let summedVolume = 0;
        let summedMaxVolume = 0;
        let summedBloodVolume = 0;
        let summedBloodMaxVolume = 0;
        let foundVolume = false;
        let foundMaxVolume = false;
        let foundBloodVolume = false;
        let foundBloodMaxVolume = false;
        for (const container of containers){
            const current = firstNumber(container?.volume, container?.currentVolume, container?.waterVolume, container?.currentWaterVolume);
            const max = firstNumber(container?.maxVolume, container?.capacity, container?.maxCapacity, container?.waterCapacity);
            const blood = firstNumber(container?.bloodVolume, container?.currentBloodVolume);
            const bloodMax = firstNumber(container?.bloodMaxVolume, container?.bloodCapacity, container?.maxBloodVolume);
            if (current !== null) {
                summedVolume += current;
                foundVolume = true;
            }
            if (max !== null) {
                summedMaxVolume += max;
                foundMaxVolume = true;
            }
            if (blood !== null) {
                summedBloodVolume += blood;
                foundBloodVolume = true;
            }
            if (bloodMax !== null) {
                summedBloodMaxVolume += bloodMax;
                foundBloodMaxVolume = true;
            }
        }
        if (volume === null && foundVolume) {
            volume = summedVolume;
        }
        if (maxVolume === null && foundMaxVolume) {
            maxVolume = summedMaxVolume;
        }
        if (bloodVolume === null && foundBloodVolume) {
            bloodVolume = summedBloodVolume;
        }
        if (bloodMaxVolume === null && foundBloodMaxVolume) {
            bloodMaxVolume = summedBloodMaxVolume;
        }
    }
    let percent = null;
    if (volume !== null && maxVolume !== null && maxVolume > 0) {
        percent = clampPercent(volume / maxVolume * 100);
    }
    let bloodPercent = null;
    if (bloodVolume !== null && bloodMaxVolume !== null && bloodMaxVolume > 0) {
        bloodPercent = clampPercent(bloodVolume / bloodMaxVolume * 100);
    }
    if (percent === null) {
        const suppliedPercent = firstNumber(water.percent, water.fillPercent, water.waterPercent);
        if (suppliedPercent !== null) {
            percent = clampPercent(suppliedPercent > 1 ? suppliedPercent : suppliedPercent * 100);
        }
    }
    if (bloodPercent === null) {
        const suppliedBloodPercent = firstNumber(water.bloodPercent, water.bloodFillPercent);
        if (suppliedBloodPercent !== null) {
            bloodPercent = clampPercent(suppliedBloodPercent > 1 ? suppliedBloodPercent : suppliedBloodPercent * 100);
        }
    }
    return {
        available: containers.length > 0 || volume !== null || maxVolume !== null,
        containers: containers.length,
        volume,
        maxVolume,
        percent,
        bloodVolume,
        bloodMaxVolume,
        bloodPercent
    };
}
/**
 * Load one base's additional telemetry.
 */ async function loadBaseTelemetry(base, duneClient) {
    const baseId = getBaseId(base);
    if (!baseId) {
        console.warn('[BASE] Cannot load water/inventory: no base ID found', base);
        return {
            ...base,
            water: null,
            inventory: null,
            storage: {
                available: false,
                used: null,
                max: null,
                percent: null
            },
            waterDataAvailable: false,
            inventoryDataAvailable: false
        };
    }
    const encodedBaseId = encodeURIComponent(String(baseId));
    const waterEndpoint = `/api/bases/${encodedBaseId}/water`;
    const inventoryEndpoint = `/api/bases/${encodedBaseId}/inventory`;
    const [waterResult, inventoryResult] = await Promise.allSettled([
        duneClient.request('GET', waterEndpoint),
        duneClient.request('GET', inventoryEndpoint)
    ]);
    let water = null;
    let inventory = null;
    if (waterResult.status === 'fulfilled') {
        water = waterResult.value;
    } else {
        console.error(`[BASE ${baseId}] Failed to load water:`, waterResult.reason);
    }
    if (inventoryResult.status === 'fulfilled') {
        inventory = inventoryResult.value;
    } else {
        console.error(`[BASE ${baseId}] Failed to load inventory:`, inventoryResult.reason);
    }
    const storage = normalizeBaseStorage(inventory);
    const normalizedWater = normalizeBaseWater(water);
    return {
        ...base,
        water,
        inventory,
        storage,
        waterSummary: normalizedWater,
        waterDataAvailable: normalizedWater.available,
        inventoryDataAvailable: storage.available
    };
}
async function GET(request) {
    try {
        // Create/get the Dune client only when the request runs.
        const duneClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$api$2f$dune$2f$route$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDuneClient"])();
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionId = cookieStore.get('dashboard_session')?.value;
        if (!sessionId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const session = /*TURBOPACK member replacement*/ __turbopack_context__.g.dashboardSessions?.get(sessionId);
        if (!session || session.expiresAt < Date.now()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Session expired or invalid'
            }, {
                status: 401
            });
        }
        const actor = {
            guildId: session.guildId,
            channelId: 'dashboard',
            userId: session.user.id,
            username: session.user.username,
            roleIds: [
                ...session.roleIds || [],
                process.env.VERIFIED_MEMBER_ROLE_ID
            ].filter(Boolean),
            interactionId: `dashboard-${Date.now()}`,
            commandName: 'portal'
        };
        if (!process.env.CONSOLE_URL) {
            throw new Error('CONSOLE_URL is not configured');
        }
        if (!process.env.ADAPTER_TOKEN) {
            throw new Error('ADAPTER_TOKEN is not configured');
        }
        const endpoint = `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;
        const resAdapter = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                actor
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.ADAPTER_TOKEN}`
            },
            cache: 'no-store'
        });
        if (!resAdapter.ok) {
            throw new Error(`Discord Adapter request failed with status: ${resAdapter.status}`);
        }
        const data = await resAdapter.json();
        if (data?.linked !== true) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
                status: 200
            });
        }
        const playerId = data.pawnId ?? data.controllerId;
        if (!playerId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ...data,
                linked: false,
                error: 'Unable to determine your Dune player ID.'
            }, {
                status: 200
            });
        }
        /**
     * Core player endpoints.
     */ const coreEndpoints = [
            'currency',
            'solaris-coin',
            'factions',
            'intel',
            'specs',
            'progression',
            'vitals',
            'bases'
        ];
        const details = await Promise.all(coreEndpoints.map(async (name)=>{
            try {
                const playerEndpoint = `/api/players/${encodeURIComponent(playerId)}/${name}`;
                const resData = await duneClient.request('GET', playerEndpoint);
                /**
             * Bases
             */ if (name === 'bases') {
                    const bases = Array.isArray(resData) ? resData : Array.isArray(resData?.rows) ? resData.rows : Array.isArray(resData?.data) ? resData.data : Array.isArray(resData?.bases) ? resData.bases : [];
                    const enrichedBases = await Promise.all(bases.map(async (base)=>loadBaseTelemetry(base, duneClient)));
                    let result;
                    if (Array.isArray(resData)) {
                        result = enrichedBases;
                    } else if (resData && typeof resData === 'object') {
                        result = {
                            ...resData,
                            rows: enrichedBases
                        };
                        if (Array.isArray(resData.data)) {
                            result.data = enrichedBases;
                        }
                        if (Array.isArray(resData.bases)) {
                            result.bases = enrichedBases;
                        }
                    } else {
                        result = {
                            rows: enrichedBases
                        };
                    }
                    return [
                        name,
                        result
                    ];
                }
                return [
                    name,
                    resData
                ];
            } catch (error) {
                console.error(`Failed to load player ${name} telemetry:`, error);
                return [
                    name,
                    null
                ];
            }
        }));
        /**
     * Final response.
     */ const responseData = {
            ...data,
            details: Object.fromEntries(details)
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(responseData, {
            status: 200
        });
    } catch (error) {
        console.error('Error inside player route telemetry processor:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            linked: false,
            error: 'Unable to load your Dune player profile right now.',
            status: error?.message
        }, {
            status: 500
        });
    }
}
}),
"[project]/infrastructure/api/core/DuneConsoleClient.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { URL } = __turbopack_context__.r("[externals]/node:url [external] (node:url, cjs)");
const { createLogger } = __turbopack_context__.r("[project]/infrastructure/core/logger.js [app-route] (ecmascript)");
const { MAX_BLUEPRINT_BYTES, validateBlueprintUpload } = __turbopack_context__.r("[project]/modules/validators/blueprintValidator.js [app-route] (ecmascript)");
const logger = createLogger("DUNE API");
const RETRYABLE_STATUS_CODES = new Set([
    408,
    425,
    429,
    500,
    502,
    503,
    504
]);
class DuneConsoleClient {
    constructor(baseUrl){
        if (!baseUrl) throw new Error("CONSOLE_URL is required to create a Dune console client.");
        this.baseUrl = new URL(baseUrl).toString();
        this.sessionCookie = null;
        this.csrfToken = null;
        this.password = null;
        this.reauthPromise = null;
    }
    async getAuthState() {
        const response = await this.request("GET", "/api/auth/state");
        this.csrfToken = response.csrfToken ?? response.csrf ?? response.token ?? this.csrfToken;
        return response;
    }
    async login(password) {
        if (!password) throw new Error("A Dune console password is required to log in.");
        this.password = password;
        const response = await this.request("POST", "/api/auth/login", {
            authenticate: false,
            body: {
                password
            },
            includeCsrf: false,
            captureSession: true,
            retryAuth: false
        });
        if (!this.sessionCookie) {
            throw new Error("Login succeeded without returning an asc_session cookie.");
        }
        await this.getAuthState();
        if (!this.csrfToken) throw new Error("The console did not provide a CSRF token after login.");
        return response;
    }
    async logout() {
        try {
            return await this.request("POST", "/api/auth/logout", {
                body: {},
                retryAuth: false
            });
        } finally{
            this.sessionCookie = null;
            this.csrfToken = null;
        }
    }
    async uploadBlueprint(playerId, attachment) {
        if (!attachment?.url || !attachment?.name) throw new Error("A valid blueprint attachment is required.");
        if (!Number.isFinite(Number(playerId)) || Number(playerId) <= 0) throw new Error("A valid linked player ID is required.");
        if (attachment.size > MAX_BLUEPRINT_BYTES) throw new Error("Blueprint files must be 32 MB or smaller.");
        const fileResponse = await fetch(attachment.url);
        if (!fileResponse.ok) throw new Error(`Unable to download the uploaded blueprint (HTTP ${fileResponse.status}).`);
        const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
        validateBlueprintUpload(attachment, fileBuffer);
        const form = new FormData();
        form.set("player_id", String(playerId));
        form.set("file", new Blob([
            fileBuffer
        ], {
            type: "application/json"
        }), attachment.name);
        return this.requestMultipart("POST", "/api/blueprints/import", form);
    }
    async request(method, route, options = {}) {
        const { authenticate = true, includeCsrf = method !== "GET" && method !== "HEAD", query, body, captureSession = false, retryAuth = true } = options;
        const url = new URL(route, this.baseUrl);
        if (query) {
            for (const [key, value] of Object.entries(query)){
                if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
            }
        }
        const headers = {
            Accept: "application/json"
        };
        if (body !== undefined) headers["Content-Type"] = "application/json";
        if (authenticate && this.sessionCookie) headers.Cookie = this.sessionCookie;
        if (includeCsrf && this.csrfToken) headers["x-csrf-token"] = this.csrfToken;
        const startedAt = Date.now();
        logger.debug(`${method} ${route} requested.`, {
            query: query ? Object.keys(query) : [],
            hasBody: body !== undefined,
            authenticated: authenticate
        });
        let response;
        for(let attempt = 1; attempt <= 3; attempt += 1){
            try {
                response = await fetch(url, {
                    method,
                    headers,
                    body: body === undefined ? undefined : JSON.stringify(body),
                    signal: AbortSignal.timeout(30_000)
                });
                if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === 3) break;
                logger.warn(`${method} ${route} returned temporary HTTP ${response.status}; retrying (${attempt}/3).`);
            } catch (error) {
                if (attempt === 3) {
                    logger.error(`${method} ${route} network request failed after ${Date.now() - startedAt}ms.`, error);
                    throw new DuneConsoleApiError(`Console API network request failed: ${error.message}`, 0, {
                        cause: error.code ?? error.name
                    });
                }
                logger.warn(`${method} ${route} network hiccup; retrying (${attempt}/3).`);
            }
            await new Promise((resolve)=>setTimeout(resolve, attempt * 1_000));
        }
        if (captureSession) this.captureSessionCookie(response);
        const data = await this.readResponse(response);
        if ((response.status === 401 || response.status === 403) && authenticate && retryAuth && this.password) {
            logger.warn(`${method} ${route} lost its Console session; re-authenticating and retrying once.`);
            await this.reauthenticate();
            return this.request(method, route, {
                ...options,
                retryAuth: false
            });
        }
        if (!response.ok) {
            const message = data?.error ?? data?.reason ?? `Request failed with HTTP ${response.status}.`;
            logger.warn(`${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
            throw new DuneConsoleApiError(message, response.status, data);
        }
        logger.debug(`${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`);
        return data;
    }
    async reauthenticate() {
        if (!this.password) throw new Error("Cannot re-authenticate without the configured console password.");
        if (!this.reauthPromise) {
            this.reauthPromise = this.login(this.password).finally(()=>{
                this.reauthPromise = null;
            });
        }
        return this.reauthPromise;
    }
    async requestMultipart(method, route, form, retryAuth = true) {
        const url = new URL(route, this.baseUrl);
        const headers = {
            Accept: "application/json"
        };
        if (this.sessionCookie) headers.Cookie = this.sessionCookie;
        if (this.csrfToken) headers["x-csrf-token"] = this.csrfToken;
        const startedAt = Date.now();
        logger.debug(`${method} ${route}`);
        let response;
        try {
            response = await fetch(url, {
                method,
                headers,
                body: form,
                signal: AbortSignal.timeout(60_000)
            });
        } catch (error) {
            logger.error(`${method} ${route} multipart request failed after ${Date.now() - startedAt}ms.`, error);
            throw new DuneConsoleApiError(`Console API upload failed: ${error.message}`, 0, {
                cause: error.code ?? error.name
            });
        }
        const data = await this.readResponse(response);
        if ((response.status === 401 || response.status === 403) && retryAuth && this.password) {
            logger.warn(`${method} ${route} lost its Console session during multipart upload; re-authenticating and retrying once.`);
            await this.reauthenticate();
            return this.requestMultipart(method, route, form, false);
        }
        if (!response.ok || data?.ok === false) {
            const message = data?.error ?? data?.reason ?? `Request failed with HTTP ${response.status}.`;
            logger.warn(`${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
            throw new DuneConsoleApiError(message, response.status, data);
        }
        logger.debug(`${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`);
        return data;
    }
    captureSessionCookie(response) {
        const cookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [
            response.headers.get("set-cookie")
        ].filter(Boolean);
        const session = cookies.find((cookie)=>cookie.startsWith("asc_session="));
        if (session) this.sessionCookie = session.split(";", 1)[0];
    }
    async readResponse(response) {
        if (response.status === 204) return null;
        const contentType = response.headers.get("content-type") ?? "";
        return contentType.includes("application/json") ? response.json() : response.text();
    }
}
class DuneConsoleApiError extends Error {
    constructor(message, status, details){
        super(message);
        this.name = "DuneConsoleApiError";
        this.status = status;
        this.details = details;
    }
}
module.exports = {
    DuneConsoleClient,
    DuneConsoleApiError
};
}),
"[project]/infrastructure/config/limits.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const BLUEPRINT_LIMITS = Object.freeze({
    maxBytes: 32 << 20,
    maxRecords: 50_000,
    maxNestingDepth: 32,
    maxObjectKeys: 2_000,
    maxStringLength: 8_192,
    minimumOfflineMs: 60_000
});
module.exports = {
    BLUEPRINT_LIMITS
};
}),
"[project]/infrastructure/core/logger.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const LEVELS = Object.freeze({
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40
});
const COLORS = Object.freeze({
    reset: "\u001B[0m",
    dim: "\u001B[2m",
    cyan: "\u001B[36m",
    green: "\u001B[32m",
    yellow: "\u001B[33m",
    red: "\u001B[31m",
    magenta: "\u001B[35m",
    blue: "\u001B[34m",
    brightCyan: "\u001B[96m",
    brightGreen: "\u001B[92m",
    brightYellow: "\u001B[93m",
    brightMagenta: "\u001B[95m",
    brightBlue: "\u001B[94m",
    brightOrange: "\u001B[38;5;208m",
    white: "\u001B[37m"
});
const LEVEL_COLORS = Object.freeze({
    DEBUG: COLORS.magenta,
    INFO: COLORS.green,
    WARN: COLORS.yellow,
    ERROR: COLORS.red
});
const SCOPE_COLORS = Object.freeze({
    BOT: COLORS.brightYellow,
    DISCORD: COLORS.brightCyan,
    "SHARD MANAGER": COLORS.brightMagenta,
    "PLAYER PANEL": COLORS.brightGreen,
    "BLUEPRINT PANEL": COLORS.yellow,
    COMMANDS: COLORS.brightBlue,
    COMPONENTS: COLORS.magenta,
    EVENTS: COLORS.green,
    INTERACTIONS: COLORS.cyan,
    "DUNE API": COLORS.yellow,
    "DISCORD ADAPTER": COLORS.brightCyan,
    "DISCORD AUDIT": COLORS.brightGreen,
    "DISCORD AUDIT LOG": COLORS.brightMagenta,
    DASHBOARD: COLORS.brightOrange,
    default: COLORS.white
});
function createLogger(scope, minimumLevel = process.env.LOG_LEVEL ?? "INFO") {
    const threshold = LEVELS[minimumLevel.toUpperCase()] ?? LEVELS.INFO;
    const scopeColor = SCOPE_COLORS[scope] ?? SCOPE_COLORS.default;
    function write(level, message, error) {
        if (LEVELS[level] < threshold) return;
        const timestamp = formatTimestamp(new Date());
        const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${LEVEL_COLORS[level]}[${level}]${COLORS.reset} ${scopeColor}[${scope}]${COLORS.reset} ${message}`;
        if (level === "ERROR") {
            error === undefined ? console.error(output) : console.error(output, error instanceof Error ? error.message : error);
        } else if (level === "WARN") {
            error === undefined ? console.warn(output) : console.warn(output, error);
        } else {
            error === undefined ? console.log(output) : console.log(output, error);
        }
    }
    return Object.freeze({
        header: (title, subtitle = "Discord control bot")=>{
            if (LEVELS.INFO < threshold) return;
            const banner = [
                "  ██████╗██████╗ ██╗███╗   ███╗███████╗ ██████╗ ███╗   ██╗    ███████╗██╗  ██╗██╗███████╗███████╗ ",
                " ██╔════╝██╔══██╗██║████╗ ████║██╔════╝██╔═══██╗████╗  ██║    ██╔════╝██║ ██╔╝██║██╔════╝██╔════╝ ",
                " ██║     ██████╔╝██║██╔████╔██║███████╗██║   ██║██╔██╗ ██║    ███████╗█████╔╝ ██║█████╗  ███████╗ ",
                " ██║     ██╔══██╗██║██║╚██╔╝██║╚════██║██║   ██║██║╚██╗██║    ╚════██║██╔═██╗ ██║██╔══╝  ╚════██║ ",
                " ╚██████╗██║  ██║██║██║ ╚═╝ ██║███████║╚██████╔╝██║ ╚████║    ███████║██║  ██╗██║███████╗███████║ ",
                "  ╚═════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝ "
            ].join("\n");
            console.log(`\n${COLORS.yellow}${banner}${COLORS.reset}`);
            console.log(`${COLORS.cyan}${title}${COLORS.reset} ${COLORS.dim}- ${subtitle}${COLORS.reset}\n`);
        },
        debug: (message, details)=>write("DEBUG", message, details),
        info: (message, details)=>write("INFO", message, details),
        warn: (message, details)=>write("WARN", message, details),
        error: (message, error)=>write("ERROR", message, error)
    });
}
function formatTimestamp(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value })=>[
            type,
            value
        ]));
    return `${values.month}/${values.day}/${values.year} ${values.hour}:${values.minute}:${values.second} ${values.dayPeriod}`;
}
module.exports = {
    createLogger
};
}),
"[project]/modules/validators/blueprintValidator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { BLUEPRINT_LIMITS } = __turbopack_context__.r("[project]/infrastructure/config/limits.js [app-route] (ecmascript)");
const MAX_BLUEPRINT_BYTES = BLUEPRINT_LIMITS.maxBytes;
const MAX_TOTAL_RECORDS = BLUEPRINT_LIMITS.maxRecords;
const MAX_NESTING_DEPTH = BLUEPRINT_LIMITS.maxNestingDepth;
const MAX_OBJECT_KEYS = BLUEPRINT_LIMITS.maxObjectKeys;
const MAX_STRING_LENGTH = BLUEPRINT_LIMITS.maxStringLength;
const FORBIDDEN_KEYS = new Set([
    "__proto__",
    "prototype",
    "constructor"
]);
function validateBlueprintUpload(attachment, fileBuffer) {
    if (!attachment?.name || !attachment?.url) throw new Error("A valid blueprint attachment is required.");
    if (!attachment.name.toLowerCase().endsWith(".json")) throw new Error("Blueprint uploads must use a .json filename.");
    if (attachment.size > MAX_BLUEPRINT_BYTES || fileBuffer.length > MAX_BLUEPRINT_BYTES) {
        throw new Error("Blueprint files must be 32 MB or smaller.");
    }
    if (fileBuffer.length === 0) throw new Error("Blueprint files cannot be empty.");
    if (fileBuffer.includes(0)) throw new Error("Blueprint files must be UTF-8 JSON text, not binary data.");
    let blueprint;
    try {
        blueprint = JSON.parse(fileBuffer.toString("utf8"));
    } catch  {
        throw new Error("The uploaded file is not valid JSON.");
    }
    if (!isPlainObject(blueprint)) throw new Error("A blueprint JSON file must contain one top-level object.");
    const collections = [
        "instances",
        "placeables",
        "pentashields"
    ];
    if (!collections.some((key)=>Array.isArray(blueprint[key]))) {
        throw new Error("The JSON file is not a valid Dune blueprint: no blueprint collections were found.");
    }
    for (const collection of collections){
        if (blueprint[collection] !== undefined && !Array.isArray(blueprint[collection])) {
            throw new Error(`Blueprint field '${collection}' must be an array.`);
        }
    }
    const state = {
        records: 0
    };
    inspectValue(blueprint, "$", 0, state);
    validateBlueprintRecords(blueprint);
    return blueprint;
}
function inspectValue(value, path, depth, state) {
    if (depth > MAX_NESTING_DEPTH) throw new Error(`Blueprint JSON is nested too deeply near ${path}.`);
    if (typeof value === "string") {
        if (value.length > MAX_STRING_LENGTH) throw new Error(`Blueprint text is too long near ${path}.`);
        if (/\u0000/.test(value)) throw new Error(`Blueprint contains an invalid null character near ${path}.`);
        return;
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) throw new Error(`Blueprint contains an invalid number near ${path}.`);
        return;
    }
    if (value === null || typeof value === "boolean") return;
    if (Array.isArray(value)) {
        for(let index = 0; index < value.length; index += 1)inspectValue(value[index], `${path}[${index}]`, depth + 1, state);
        return;
    }
    if (!isPlainObject(value)) throw new Error(`Blueprint contains an unsupported value near ${path}.`);
    const entries = Object.entries(value);
    if (entries.length > MAX_OBJECT_KEYS) throw new Error(`Blueprint object has too many fields near ${path}.`);
    for (const [key, child] of entries){
        if (FORBIDDEN_KEYS.has(key.toLowerCase())) throw new Error(`Blueprint contains a forbidden field near ${path}.`);
        inspectValue(child, `${path}.${key}`, depth + 1, state);
    }
}
function validateBlueprintRecords(blueprint) {
    for (const collection of [
        "instances",
        "placeables",
        "pentashields"
    ]){
        for (const [index, record] of (blueprint[collection] ?? []).entries()){
            if (!isPlainObject(record)) throw new Error(`Blueprint ${collection}[${index}] must be an object.`);
            if ([
                "instances",
                "placeables"
            ].includes(collection) && typeof record.building_type !== "string") {
                throw new Error(`Blueprint ${collection}[${index}] is missing a building_type.`);
            }
            if (collection === "instances" && record.instance_id !== undefined && !Number.isFinite(Number(record.instance_id))) {
                throw new Error(`Blueprint instances[${index}] has an invalid instance_id.`);
            }
        }
    }
    const total = (blueprint.instances?.length ?? 0) + (blueprint.placeables?.length ?? 0) + (blueprint.pentashields?.length ?? 0);
    if (total > MAX_TOTAL_RECORDS) throw new Error(`Blueprint has too many records (${total.toLocaleString()}; maximum ${MAX_TOTAL_RECORDS.toLocaleString()}).`);
}
function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
module.exports = {
    MAX_BLUEPRINT_BYTES,
    validateBlueprintUpload
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1zorgig._.js.map