module.exports = [
"[project]/dashboard/app/portal/page.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerPortal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../components/tabs/PortalTabs'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
;
;
const MAX_POWER_SECONDS = 42 * 24 * 60 * 60;
const REFRESH_INTERVAL = 60000;
const COLORS = {
    page: '#080604',
    pageTop: '#24170d',
    panel: '#1d120c',
    panelLight: '#24170f',
    border: '#3c2415',
    borderLight: '#ffffff10',
    text: '#ffe2a9',
    textSoft: '#dbc19a',
    muted: '#a08568',
    dim: '#7f6953',
    gold: '#d2a85a',
    goldLight: '#cda26b',
    red: '#ff4a4a',
    green: '#52fa7c',
    blue: '#4a90e2',
    water: '#7db8e8'
};
const LEVEL_XP = [
    {
        level: 1,
        xp: 40
    },
    {
        level: 2,
        xp: 215
    },
    {
        level: 3,
        xp: 440
    },
    {
        level: 4,
        xp: 740
    },
    {
        level: 5,
        xp: 1240
    },
    {
        level: 6,
        xp: 1790
    },
    {
        level: 7,
        xp: 2390
    },
    {
        level: 8,
        xp: 2990
    },
    {
        level: 9,
        xp: 3590
    },
    {
        level: 10,
        xp: 4190
    },
    {
        level: 11,
        xp: 4790
    },
    {
        level: 12,
        xp: 5390
    },
    {
        level: 13,
        xp: 5990
    },
    {
        level: 14,
        xp: 6590
    },
    {
        level: 15,
        xp: 7190
    },
    {
        level: 16,
        xp: 7790
    },
    {
        level: 17,
        xp: 8390
    },
    {
        level: 18,
        xp: 8990
    },
    {
        level: 19,
        xp: 9590
    },
    {
        level: 20,
        xp: 10190
    },
    {
        level: 21,
        xp: 10790
    },
    {
        level: 22,
        xp: 11390
    },
    {
        level: 23,
        xp: 11990
    },
    {
        level: 24,
        xp: 12590
    },
    {
        level: 25,
        xp: 13190
    },
    {
        level: 26,
        xp: 13790
    },
    {
        level: 27,
        xp: 14390
    },
    {
        level: 28,
        xp: 14990
    },
    {
        level: 29,
        xp: 15590
    },
    {
        level: 30,
        xp: 16190
    },
    {
        level: 31,
        xp: 16790
    },
    {
        level: 32,
        xp: 17390
    },
    {
        level: 33,
        xp: 17990
    },
    {
        level: 34,
        xp: 18590
    },
    {
        level: 35,
        xp: 19190
    },
    {
        level: 36,
        xp: 19790
    },
    {
        level: 37,
        xp: 20390
    },
    {
        level: 38,
        xp: 20990
    },
    {
        level: 39,
        xp: 21590
    },
    {
        level: 40,
        xp: 22190
    },
    {
        level: 41,
        xp: 22790
    },
    {
        level: 42,
        xp: 23390
    },
    {
        level: 43,
        xp: 23990
    },
    {
        level: 44,
        xp: 24590
    },
    {
        level: 45,
        xp: 25190
    },
    {
        level: 46,
        xp: 25790
    },
    {
        level: 47,
        xp: 26390
    },
    {
        level: 48,
        xp: 26990
    },
    {
        level: 49,
        xp: 27590
    },
    {
        level: 50,
        xp: 28190
    },
    {
        level: 51,
        xp: 28790
    },
    {
        level: 52,
        xp: 29390
    },
    {
        level: 53,
        xp: 29990
    },
    {
        level: 54,
        xp: 30590
    },
    {
        level: 55,
        xp: 31190
    },
    {
        level: 56,
        xp: 31790
    },
    {
        level: 57,
        xp: 32390
    },
    {
        level: 58,
        xp: 32990
    },
    {
        level: 59,
        xp: 33590
    },
    {
        level: 60,
        xp: 34190
    },
    {
        level: 61,
        xp: 34790
    },
    {
        level: 62,
        xp: 35390
    },
    {
        level: 63,
        xp: 35990
    },
    {
        level: 64,
        xp: 36590
    },
    {
        level: 65,
        xp: 37190
    },
    {
        level: 66,
        xp: 37790
    },
    {
        level: 67,
        xp: 38390
    },
    {
        level: 68,
        xp: 38990
    },
    {
        level: 69,
        xp: 39590
    },
    {
        level: 70,
        xp: 40190
    },
    {
        level: 71,
        xp: 40790
    },
    {
        level: 72,
        xp: 41390
    },
    {
        level: 73,
        xp: 41990
    },
    {
        level: 74,
        xp: 42590
    },
    {
        level: 75,
        xp: 43190
    },
    {
        level: 76,
        xp: 43790
    },
    {
        level: 77,
        xp: 44390
    },
    {
        level: 78,
        xp: 44990
    },
    {
        level: 79,
        xp: 45590
    },
    {
        level: 80,
        xp: 46190
    },
    {
        level: 81,
        xp: 46790
    },
    {
        level: 82,
        xp: 47390
    },
    {
        level: 83,
        xp: 47990
    },
    {
        level: 84,
        xp: 48590
    },
    {
        level: 85,
        xp: 49190
    },
    {
        level: 86,
        xp: 49790
    },
    {
        level: 87,
        xp: 50390
    },
    {
        level: 88,
        xp: 50990
    },
    {
        level: 89,
        xp: 51590
    },
    {
        level: 90,
        xp: 52190
    },
    {
        level: 91,
        xp: 52790
    },
    {
        level: 92,
        xp: 53390
    },
    {
        level: 93,
        xp: 53990
    },
    {
        level: 94,
        xp: 54590
    },
    {
        level: 95,
        xp: 55190
    },
    {
        level: 96,
        xp: 55790
    },
    {
        level: 97,
        xp: 56390
    },
    {
        level: 98,
        xp: 56990
    },
    {
        level: 99,
        xp: 57590
    },
    {
        level: 100,
        xp: 58190
    },
    {
        level: 101,
        xp: 58840
    },
    {
        level: 102,
        xp: 59490
    },
    {
        level: 103,
        xp: 60140
    },
    {
        level: 104,
        xp: 60790
    },
    {
        level: 105,
        xp: 61440
    },
    {
        level: 106,
        xp: 62090
    },
    {
        level: 107,
        xp: 62740
    },
    {
        level: 108,
        xp: 63390
    },
    {
        level: 109,
        xp: 64040
    },
    {
        level: 110,
        xp: 64690
    },
    {
        level: 111,
        xp: 65340
    },
    {
        level: 112,
        xp: 65990
    },
    {
        level: 113,
        xp: 66640
    },
    {
        level: 114,
        xp: 67290
    },
    {
        level: 115,
        xp: 67940
    },
    {
        level: 116,
        xp: 68590
    },
    {
        level: 117,
        xp: 69240
    },
    {
        level: 118,
        xp: 69890
    },
    {
        level: 119,
        xp: 70540
    },
    {
        level: 120,
        xp: 71190
    },
    {
        level: 121,
        xp: 71840
    },
    {
        level: 122,
        xp: 72490
    },
    {
        level: 123,
        xp: 73140
    },
    {
        level: 124,
        xp: 73790
    },
    {
        level: 125,
        xp: 74440
    },
    {
        level: 126,
        xp: 75090
    },
    {
        level: 127,
        xp: 75740
    },
    {
        level: 128,
        xp: 76391
    },
    {
        level: 129,
        xp: 77044
    },
    {
        level: 130,
        xp: 77699
    },
    {
        level: 131,
        xp: 78357
    },
    {
        level: 132,
        xp: 79018
    },
    {
        level: 133,
        xp: 79683
    },
    {
        level: 134,
        xp: 80353
    },
    {
        level: 135,
        xp: 81030
    },
    {
        level: 136,
        xp: 81714
    },
    {
        level: 137,
        xp: 82407
    },
    {
        level: 138,
        xp: 83110
    },
    {
        level: 139,
        xp: 83825
    },
    {
        level: 140,
        xp: 84554
    },
    {
        level: 141,
        xp: 85298
    },
    {
        level: 142,
        xp: 86060
    },
    {
        level: 143,
        xp: 86842
    },
    {
        level: 144,
        xp: 87646
    },
    {
        level: 145,
        xp: 88475
    },
    {
        level: 146,
        xp: 89332
    },
    {
        level: 147,
        xp: 90220
    },
    {
        level: 148,
        xp: 91141
    },
    {
        level: 149,
        xp: 92100
    },
    {
        level: 150,
        xp: 93099
    },
    {
        level: 151,
        xp: 94143
    },
    {
        level: 152,
        xp: 95235
    },
    {
        level: 153,
        xp: 96380
    },
    {
        level: 154,
        xp: 97582
    },
    {
        level: 155,
        xp: 98845
    },
    {
        level: 156,
        xp: 100175
    },
    {
        level: 157,
        xp: 101576
    },
    {
        level: 158,
        xp: 103054
    },
    {
        level: 159,
        xp: 104614
    },
    {
        level: 160,
        xp: 106263
    },
    {
        level: 161,
        xp: 108006
    },
    {
        level: 162,
        xp: 109849
    },
    {
        level: 163,
        xp: 111799
    },
    {
        level: 164,
        xp: 113862
    },
    {
        level: 165,
        xp: 116046
    },
    {
        level: 166,
        xp: 118358
    },
    {
        level: 167,
        xp: 120806
    },
    {
        level: 168,
        xp: 123397
    },
    {
        level: 169,
        xp: 126139
    },
    {
        level: 170,
        xp: 129041
    },
    {
        level: 171,
        xp: 132112
    },
    {
        level: 172,
        xp: 135360
    },
    {
        level: 173,
        xp: 138795
    },
    {
        level: 174,
        xp: 142426
    },
    {
        level: 175,
        xp: 146263
    },
    {
        level: 176,
        xp: 150316
    },
    {
        level: 177,
        xp: 154596
    },
    {
        level: 178,
        xp: 159114
    },
    {
        level: 179,
        xp: 163880
    },
    {
        level: 180,
        xp: 168906
    },
    {
        level: 181,
        xp: 174203
    },
    {
        level: 182,
        xp: 179784
    },
    {
        level: 183,
        xp: 185661
    },
    {
        level: 184,
        xp: 191846
    },
    {
        level: 185,
        xp: 198353
    },
    {
        level: 186,
        xp: 205195
    },
    {
        level: 187,
        xp: 212385
    },
    {
        level: 188,
        xp: 219938
    },
    {
        level: 189,
        xp: 227868
    },
    {
        level: 190,
        xp: 236190
    },
    {
        level: 191,
        xp: 244918
    },
    {
        level: 192,
        xp: 254069
    },
    {
        level: 193,
        xp: 263657
    },
    {
        level: 194,
        xp: 273700
    },
    {
        level: 195,
        xp: 284213
    },
    {
        level: 196,
        xp: 295214
    },
    {
        level: 197,
        xp: 306719
    },
    {
        level: 198,
        xp: 318746
    },
    {
        level: 199,
        xp: 331314
    },
    {
        level: 200,
        xp: 344440
    }
];
const styles = {
    page: {
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        padding: '40px 0 70px',
        background: `
      radial-gradient(
        circle at 50% -10%,
        ${COLORS.pageTop} 0%,
        #120b07 42%,
        ${COLORS.page} 80%
      )
    `,
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    container: {
        width: 'calc(100% - 32px)',
        maxWidth: 1400,
        margin: '0 auto'
    },
    panel: {
        background: `linear-gradient(145deg, ${COLORS.panelLight}, ${COLORS.panel})`,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        boxSizing: 'border-box',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)'
    },
    sectionTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontFamily: 'Georgia, serif',
        fontWeight: 600,
        color: COLORS.text
    },
    muted: {
        color: COLORS.muted
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: '#ffffff0a',
        borderRadius: 999,
        overflow: 'hidden'
    }
};
function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return 0;
    }
    return Math.max(0, Math.min(100, number));
}
function getBaseId(base) {
    return base?.base_id ?? base?.baseId ?? base?.id ?? base?.uuid ?? null;
}
function getNumber(...values) {
    for (const value of values){
        const number = Number(value);
        if (Number.isFinite(number)) {
            return number;
        }
    }
    return null;
}
function formatNumber(value, maximumFractionDigits = 1) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return '—';
    }
    return number.toLocaleString(undefined, {
        maximumFractionDigits
    });
}
function formatVolume(value) {
    return formatNumber(value, 1);
}
function formatStorage(value) {
    return formatNumber(value, 1);
}
function getLevelProgress(level, xp) {
    const numericLevel = Math.max(1, Math.min(200, Number(level) || 1));
    const numericXp = Math.max(0, Number(xp) || 0);
    const currentLevelData = LEVEL_XP.find((entry)=>entry.level === numericLevel);
    const nextLevelData = LEVEL_XP.find((entry)=>entry.level === numericLevel + 1);
    // Level 200 is the maximum.
    if (!nextLevelData) {
        return {
            percent: 100,
            currentXp: numericXp,
            levelStartXp: currentLevelData?.xp ?? 0,
            nextLevelXp: 344440,
            remainingXp: 0,
            maxLevel: true
        };
    }
    const levelStartXp = currentLevelData?.xp ?? 0;
    const nextLevelXp = nextLevelData.xp;
    const levelRange = nextLevelXp - levelStartXp;
    const progressXp = Math.max(0, Math.min(levelRange, numericXp - levelStartXp));
    return {
        percent: levelRange > 0 ? progressXp / levelRange * 100 : 0,
        currentXp: numericXp,
        levelStartXp,
        nextLevelXp,
        remainingXp: Math.max(0, nextLevelXp - numericXp),
        maxLevel: false
    };
}
function getPowerColor(percent) {
    if (percent <= 10) {
        return COLORS.red;
    }
    if (percent <= 25) {
        return '#e5b85c';
    }
    return COLORS.gold;
}
function getStorageColor(percent) {
    if (percent === null) {
        return '#a08568';
    }
    if (percent >= 90) {
        return COLORS.red;
    }
    if (percent >= 75) {
        return '#e5b85c';
    }
    return COLORS.gold;
}
function getWaterColor(percent) {
    if (percent !== null && percent <= 10) {
        return COLORS.red;
    }
    if (percent !== null && percent <= 25) {
        return '#e5b85c';
    }
    return COLORS.water;
}
function getGeneratorSeconds(base) {
    return Math.max(0, getNumber(base?.generatorRuntimeSeconds, base?.generator_runtime_seconds, base?.generatorRuntime, base?.generator_runtime, base?.powerSeconds, base?.power_seconds) ?? 0);
}
function getStorageData(data) {
    const root = data?.data ?? data ?? {};
    const totals = root.totals ?? {};
    const storage = root.storage ?? {};
    const used = getNumber(totals.currentVolume, totals.current_volume, root.currentVolume, root.current_volume, storage.used);
    const max = getNumber(totals.maxVolume, totals.max_volume, root.maxVolume, root.max_volume, storage.max);
    let percent = getNumber(totals.volumePercent, totals.volume_percent, root.volumePercent, root.volume_percent, storage.percent);
    if (percent === null && used !== null && max !== null && max > 0) {
        percent = used / max * 100;
    }
    return {
        used,
        max,
        percent: percent === null ? null : clampPercent(percent),
        available: storage.available !== false && (used !== null || max !== null)
    };
}
function getWaterData(data) {
    const root = data?.data ?? data ?? {};
    const summary = root.waterSummary ?? root.water_summary ?? {};
    const containers = root.containers ?? root.waterContainers ?? root.water_containers ?? root.rows ?? [];
    let current = getNumber(summary.volume, summary.currentVolume, summary.current_volume, root.volume, root.currentVolume, root.current_volume, root.totalVolume, root.total_volume, root.waterVolume, root.water_volume, root.stored, root.current);
    let max = getNumber(summary.maxVolume, summary.max_volume, root.maxVolume, root.max_volume, root.capacity, root.maxCapacity, root.max_capacity, root.totalCapacity, root.total_capacity);
    let percent = getNumber(summary.percent, summary.fillPercent, summary.fill_percentage, summary.fillPercentage, root.fillPercent, root.fill_percentage, root.fillPercentage, root.percent, root.percentage);
    let containerCount = getNumber(summary.containers, summary.containerCount, summary.container_count, root.count, root.containerCount, root.container_count);
    if (Array.isArray(containers)) {
        if (containerCount === null) {
            containerCount = containers.length;
        }
        if (current === null) {
            let totalCurrent = 0;
            let foundCurrent = false;
            for (const container of containers){
                const value = getNumber(container?.volume, container?.currentVolume, container?.current_volume, container?.stored, container?.current, container?.amount);
                if (value !== null) {
                    totalCurrent += value;
                    foundCurrent = true;
                }
            }
            if (foundCurrent) {
                current = totalCurrent;
            }
        }
        if (max === null) {
            let totalMax = 0;
            let foundMax = false;
            for (const container of containers){
                const value = getNumber(container?.maxVolume, container?.max_volume, container?.capacity, container?.maxCapacity, container?.max_capacity);
                if (value !== null) {
                    totalMax += value;
                    foundMax = true;
                }
            }
            if (foundMax && totalMax > 0) {
                max = totalMax;
            }
        }
    }
    if (percent === null && current !== null && max !== null && max > 0) {
        percent = current / max * 100;
    }
    return {
        current,
        max,
        percent: percent === null ? null : clampPercent(percent),
        containerCount: containerCount ?? 0,
        available: max !== null || current !== null
    };
}
function extractBases(player) {
    const response = player?.details?.bases ?? {};
    if (Array.isArray(response)) {
        return response;
    }
    if (Array.isArray(response.rows)) {
        return response.rows;
    }
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return [];
}
function isOwnedBase(base) {
    const relationship = String(base?.relationship ?? base?.relation ?? base?.access ?? '').trim().toLowerCase();
    if (relationship === 'owner' || relationship === 'owned' || relationship === 'self' || relationship === 'own') {
        return true;
    }
    if (relationship === 'shared' || relationship === 'member' || relationship === 'visitor' || relationship === 'guest' || relationship === 'shared base') {
        return false;
    }
    const owned = base?.owned ?? base?.isOwner ?? base?.is_owner;
    if (owned === true || owned === 1 || owned === 'true') {
        return true;
    }
    return false;
}
function getBaseRelationship(base) {
    if (isOwnedBase(base)) {
        return 'Owned';
    }
    const relationship = base?.relationship ?? base?.relation ?? base?.access;
    if (relationship) {
        return relationship;
    }
    return 'Shared';
}
function getBaseName(base, index) {
    return base?.name ?? base?.baseName ?? base?.base_name ?? base?.title ?? `Base ${index + 1}`;
}
function getBaseType(base) {
    return base?.base_type ?? base?.baseType ?? base?.type ?? 'Unknown';
}
function getBaseOwner(base) {
    return base?.owner_name ?? base?.ownerName ?? base?.owner ?? 'Unknown';
}
function ProgressBar({ percent, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.progressTrack,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: `${clampPercent(percent)}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: color,
                transition: 'width 0.5s ease',
                boxShadow: `0 0 8px ${color}`
            }
        }, void 0, false, {
            fileName: "[project]/dashboard/app/portal/page.js",
            lineNumber: 756,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/dashboard/app/portal/page.js",
        lineNumber: 755,
        columnNumber: 5
    }, this);
}
function TelemetryMetric({ label, percent, value, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minWidth: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 7
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: COLORS.dim,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px'
                        },
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 787,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            color,
                            fontSize: '0.72rem',
                            whiteSpace: 'nowrap'
                        },
                        children: percent === null ? 'N/A' : `${percent.toFixed(0)}%`
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 799,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 778,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                percent: percent ?? 0,
                color: color
            }, void 0, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 812,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    color: COLORS.dim,
                    fontSize: '0.68rem',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                children: value
            }, void 0, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 817,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/app/portal/page.js",
        lineNumber: 777,
        columnNumber: 5
    }, this);
}
function getCurrencyValue(...values) {
    for (const value of values){
        if (value === null || value === undefined) {
            continue;
        }
        // Handle currency response objects containing rows
        if (typeof value === 'object' && !Array.isArray(value)) {
            if (Array.isArray(value.rows)) {
                for (const row of value.rows){
                    const label = String(row?.label ?? '').toLowerCase();
                    if (label.includes('solari') || label.includes('credit')) {
                        const balance = Number(row?.balance);
                        if (Number.isFinite(balance)) {
                            return balance;
                        }
                    }
                }
            }
            const nested = getNumber(value.total, value.amount, value.balance, value.current, value.value, value.credits, value.credit, value.solarisCredit, value.solaris_credit);
            if (nested !== null) {
                return nested;
            }
            continue;
        }
        const number = Number(value);
        if (Number.isFinite(number)) {
            return number;
        }
    }
    return 0;
}
function BaseCard({ base, index, telemetry }) {
    const baseId = getBaseId(base);
    const baseName = getBaseName(base, index);
    const baseType = getBaseType(base);
    const owner = getBaseOwner(base);
    const relationship = getBaseRelationship(base);
    const inventory = telemetry?.inventory ?? base?.inventory ?? base?.inventoryData ?? base;
    const water = telemetry?.water ?? base?.water ?? base?.waterData ?? base;
    const runtimeSeconds = getGeneratorSeconds(base);
    const powerPercent = clampPercent(runtimeSeconds / MAX_POWER_SECONDS * 100);
    const daysRemaining = runtimeSeconds / (24 * 60 * 60);
    const fullDays = Math.floor(daysRemaining);
    const remainingHours = Math.floor((daysRemaining - fullDays) * 24);
    const generatorAvailable = base?.generatorDataAvailable !== false;
    const waterData = getWaterData(water);
    const waterCurrent = waterData.current;
    const waterMax = waterData.max;
    const waterPercent = waterData.percent;
    const waterAvailable = waterData.available && waterMax !== null && waterMax > 0;
    const storageData = getStorageData(inventory);
    const storageUsed = storageData.used;
    const storageMax = storageData.max;
    const storagePercent = storageData.percent;
    const storageAvailable = storageData.available && storageMax !== null && storageMax > 0;
    const isOwned = isOwnedBase(base);
    const dotColor = isOwned ? COLORS.gold : COLORS.water;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        style: {
            background: `
          linear-gradient(
            145deg,
            rgba(255,255,255,0.025),
            rgba(255,255,255,0.008)
          ),
          ${COLORS.panel}
        `,
            border: `1px solid ${isOwned ? 'rgba(210, 168, 90, 0.22)' : 'rgba(125, 184, 232, 0.18)'}`,
            borderRadius: 14,
            padding: 22,
            minWidth: 0,
            boxSizing: 'border-box',
            boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
            minHeight: 260
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 16,
                    marginBottom: 17,
                    borderBottom: `1px solid ${COLORS.borderLight}`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            minWidth: 0,
                            flex: 1
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "portal-glow-dot",
                                        style: {
                                            width: 8,
                                            height: 8,
                                            flexShrink: 0,
                                            borderRadius: '50%',
                                            backgroundColor: dotColor,
                                            boxShadow: `
                  0 0 4px ${dotColor},
                  0 0 9px ${dotColor},
                  0 0 18px ${dotColor},
                  0 0 28px ${dotColor}
                `,
                                            '--dot-color': dotColor
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 1022,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            color: COLORS.text,
                                            fontSize: '1.05rem',
                                            fontWeight: 650,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        },
                                        title: baseName,
                                        children: baseName
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 1040,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1013,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: COLORS.dim,
                                    fontSize: '0.72rem',
                                    marginTop: 5,
                                    paddingLeft: 18,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                },
                                title: baseType,
                                children: baseType
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1055,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1007,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            flexShrink: 0,
                            padding: '5px 9px',
                            borderRadius: 999,
                            backgroundColor: isOwned ? 'rgba(210,168,90,0.08)' : 'rgba(125,184,232,0.08)',
                            border: `1px solid ${isOwned ? 'rgba(210,168,90,0.2)' : 'rgba(125,184,232,0.2)'}`,
                            color: isOwned ? '#e3c27f' : '#8fc6ee',
                            fontSize: '0.63rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        },
                        children: relationship
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1071,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 995,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 20,
                    padding: '11px 13px',
                    backgroundColor: '#ffffff04',
                    border: `1px solid ${COLORS.borderLight}`,
                    borderRadius: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            color: COLORS.dim,
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 3
                        },
                        children: "Owner"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            color: COLORS.textSoft,
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        },
                        title: owner,
                        children: owner
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1098,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 18
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TelemetryMetric, {
                        label: "Runtime",
                        percent: generatorAvailable ? powerPercent : null,
                        color: getPowerColor(powerPercent),
                        value: generatorAvailable ? `${fullDays}d ${remainingHours}h remaining` : 'Unavailable'
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TelemetryMetric, {
                        label: "Water",
                        percent: waterPercent,
                        color: getWaterColor(waterPercent),
                        value: waterAvailable ? `${formatVolume(waterCurrent)} / ${formatVolume(waterMax)}` : waterMax !== null ? `— / ${formatVolume(waterMax)}` : 'No data'
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TelemetryMetric, {
                        label: "Storage",
                        percent: storagePercent,
                        color: getStorageColor(storagePercent),
                        value: storageAvailable ? `${formatStorage(storageUsed)} / ${formatStorage(storageMax)}` : 'No data'
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1182,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1136,
                columnNumber: 7
            }, this),
            telemetry?.waterError && !waterData.available || telemetry?.inventoryError && !storageData.available ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 15,
                    paddingTop: 11,
                    borderTop: `1px solid ${COLORS.borderLight}`,
                    color: '#9b7462',
                    fontSize: '0.65rem',
                    lineHeight: 1.5
                },
                children: "Telemetry unavailable for one or more systems."
            }, void 0, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1209,
                columnNumber: 9
            }, this) : null,
            baseId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 14,
                    color: '#5f4d3d',
                    fontSize: '0.58rem',
                    fontFamily: 'monospace'
                }
            }, void 0, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1226,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/app/portal/page.js",
        lineNumber: 970,
        columnNumber: 5
    }, this);
}
function BaseGrid({ bases, telemetry }) {
    if (bases.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: 32,
                textAlign: 'center',
                backgroundColor: '#ffffff03',
                border: `1px solid ${COLORS.borderLight}`,
                borderRadius: 10
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: COLORS.textSoft,
                        fontSize: '0.9rem',
                        marginBottom: 5
                    },
                    children: "No bases found"
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1255,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: COLORS.dim,
                        fontSize: '0.75rem'
                    },
                    children: "There are currently no bases in this category."
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1265,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/app/portal/page.js",
            lineNumber: 1245,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "base-grid",
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 18
        },
        children: bases.map((base, index)=>{
            const isOddFinalBase = bases.length % 2 === 1 && index === bases.length - 1;
            const baseId = getBaseId(base);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: isOddFinalBase ? 'base-grid-last' : '',
                style: {
                    minWidth: 0,
                    gridColumn: isOddFinalBase ? '1 / -1' : 'auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BaseCard, {
                    base: base,
                    index: index,
                    telemetry: baseId ? telemetry[baseId] : null
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1313,
                    columnNumber: 13
                }, this)
            }, baseId ?? `base-${index}`, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1296,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/dashboard/app/portal/page.js",
        lineNumber: 1279,
        columnNumber: 5
    }, this);
}
function PlayerPortal() {
    const [player, setPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [statusLoading, setStatusLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const refreshInProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [basesTelemetry, setBasesTelemetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [basesLoading, setBasesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [baseTab, setBaseTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('owned');
    async function loadBaseTelemetry(bases) {
        if (!Array.isArray(bases) || bases.length === 0) {
            setBasesTelemetry({});
            setBasesLoading(false);
            return;
        }
        setBasesLoading(true);
        const results = await Promise.all(bases.map(async (base)=>{
            const baseId = getBaseId(base);
            if (!baseId) {
                return {
                    id: null,
                    water: null,
                    inventory: null,
                    waterError: 'Missing base ID',
                    inventoryError: 'Missing base ID'
                };
            }
            const waterUrl = `/api/bases/${encodeURIComponent(baseId)}/water`;
            const inventoryUrl = `/api/bases/${encodeURIComponent(baseId)}/inventory`;
            const [waterResult, inventoryResult] = await Promise.allSettled([
                fetch(waterUrl, {
                    cache: 'no-store'
                }),
                fetch(inventoryUrl, {
                    cache: 'no-store'
                })
            ]);
            let water = null;
            let inventory = null;
            let waterError = null;
            let inventoryError = null;
            try {
                if (waterResult.status === 'fulfilled') {
                    if (waterResult.value.ok) {
                        water = await waterResult.value.json();
                    } else {
                        waterError = `Water API returned ${waterResult.value.status}`;
                    }
                } else {
                    waterError = waterResult.reason?.message || 'Water request failed';
                }
            } catch (error) {
                waterError = error?.message || 'Invalid water response';
            }
            try {
                if (inventoryResult.status === 'fulfilled') {
                    if (inventoryResult.value.ok) {
                        inventory = await inventoryResult.value.json();
                    } else {
                        inventoryError = `Inventory API returned ${inventoryResult.value.status}`;
                    }
                } else {
                    inventoryError = inventoryResult.reason?.message || 'Inventory request failed';
                }
            } catch (error) {
                inventoryError = error?.message || 'Invalid inventory response';
            }
            return {
                id: baseId,
                water,
                inventory,
                waterError,
                inventoryError
            };
        }));
        const nextTelemetry = {};
        for (const result of results){
            if (result.id) {
                nextTelemetry[result.id] = result;
            }
        }
        setBasesTelemetry(nextTelemetry);
        setBasesLoading(false);
    }
    async function loadPlayerData(showLoading = false) {
        if (refreshInProgress.current) {
            return;
        }
        refreshInProgress.current = true;
        try {
            if (showLoading) {
                setLoading(true);
            }
            setStatusLoading(true);
            const res = await fetch('/api/player', {
                cache: 'no-store'
            });
            if (res.status === 401) {
                window.location.href = '/auth/login';
                return;
            }
            if (!res.ok) {
                console.error('Player API returned:', res.status);
                return;
            }
            const data = await res.json();
            const bases = extractBases(data);
            /*
      * Keep the old telemetry visible.
      * This prevents cards from disappearing/reappearing
      * during refresh.
      */ setPlayer(data);
            await loadBaseTelemetry(bases);
        } catch (error) {
            console.error('Failed to fetch player data:', error);
        } finally{
            setStatusLoading(false);
            refreshInProgress.current = false;
            if (showLoading) {
                setLoading(false);
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function initialLoad() {
            if (cancelled) {
                return;
            }
            await loadPlayerData(true);
        }
        initialLoad();
        const interval = setInterval(()=>{
            if (!cancelled) {
                loadPlayerData(false);
            }
        }, REFRESH_INTERVAL);
        return ()=>{
            cancelled = true;
            clearInterval(interval);
        };
    }, []);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            style: {
                ...styles.page,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                textAlign: 'center'
            },
            className: "jsx-f9f0d77e597ea459",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-f9f0d77e597ea459",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 34,
                                height: 34,
                                margin: '0 auto 16px',
                                borderRadius: '50%',
                                border: '2px solid rgba(210,168,90,0.2)',
                                borderTopColor: COLORS.gold,
                                animation: 'portalSpin 0.9s linear infinite',
                                boxShadow: `0 0 12px rgba(210,168,90,0.45), 0 0 25px rgba(210,168,90,0.2)`
                            },
                            className: "jsx-f9f0d77e597ea459"
                        }, void 0, false, {
                            fileName: "[project]/dashboard/app/portal/page.js",
                            lineNumber: 1581,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                margin: 0,
                                color: COLORS.muted,
                                fontSize: '0.9rem'
                            },
                            className: "jsx-f9f0d77e597ea459",
                            children: "Synchronizing with Dune Awakening Console telemetry..."
                        }, void 0, false, {
                            fileName: "[project]/dashboard/app/portal/page.js",
                            lineNumber: 1598,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1580,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    id: "f9f0d77e597ea459",
                    children: "@keyframes portalSpin{to{transform:rotate(360deg)}}@keyframes portalGlow{0%,to{opacity:.9;filter:brightness();transform:scale(1)}50%{opacity:1;filter:brightness(1.6);transform:scale(1.35)}}@keyframes portalGlowStrong{0%,to{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}.portal-glow-dot.jsx-f9f0d77e597ea459{animation:2.2s ease-in-out infinite portalGlow}.portal-status-dot.jsx-f9f0d77e597ea459{animation:1.8s ease-in-out infinite portalGlowStrong}"
                }, void 0, false, void 0, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/app/portal/page.js",
            lineNumber: 1570,
            columnNumber: 7
        }, this);
    }
    if (!player?.linked) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            style: styles.page,
            className: "jsx-cf1212906bde91e8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalTabs, {
                    activeTab: "Character"
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1663,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: styles.container,
                    className: "jsx-cf1212906bde91e8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...styles.panel,
                            padding: 36,
                            textAlign: 'center',
                            marginTop: 20
                        },
                        className: "jsx-cf1212906bde91e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 52,
                                    height: 52,
                                    margin: '0 auto 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,74,74,0.08)',
                                    border: '1px solid rgba(255,74,74,0.2)',
                                    color: COLORS.red,
                                    fontSize: '1.3rem',
                                    boxShadow: `0 0 12px rgba(255,74,74,0.35), 0 0 28px rgba(255,74,74,0.12)`
                                },
                                className: "jsx-cf1212906bde91e8",
                                children: "!"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1674,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    color: COLORS.red,
                                    fontSize: '1.2rem',
                                    display: 'block',
                                    marginBottom: 10
                                },
                                className: "jsx-cf1212906bde91e8",
                                children: "No Linked Dune Character Found"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1696,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: COLORS.muted,
                                    margin: 0,
                                    lineHeight: 1.7,
                                    maxWidth: 600,
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                },
                                className: "jsx-cf1212906bde91e8",
                                children: "Please link your character in-game or via the Discord server integrations panel first."
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1708,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/dashboard",
                                style: {
                                    display: 'inline-block',
                                    marginTop: 22,
                                    color: COLORS.goldLight,
                                    textDecoration: 'none',
                                    padding: '9px 16px',
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: 7,
                                    backgroundColor: COLORS.panel,
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                },
                                className: "jsx-cf1212906bde91e8",
                                children: "← Return to Admin Panel"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1724,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1666,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/portal/page.js",
                    lineNumber: 1665,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    id: "cf1212906bde91e8",
                    children: "@keyframes portalGlowStrong{0%,to{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}.portal-status-dot.jsx-cf1212906bde91e8{animation:1.8s ease-in-out infinite portalGlowStrong}"
                }, void 0, false, void 0, this)
            ]
        }, void 0, true, {
            fileName: "[project]/dashboard/app/portal/page.js",
            lineNumber: 1662,
            columnNumber: 7
        }, this);
    }
    const details = player.details || {};
    const progression = details.progression || {};
    const intel = details.intel || {};
    const vitals = details.vitals || {};
    const solarisCoin = details['solaris-coin'] || {};
    const bases = extractBases(player);
    const character = {
        name: player.characterName || 'Unknown Character',
        status: player.onlineStatus || 'Offline',
        level: getNumber(progression.level, progression.characterLevel, progression.character_level, details.level, player.level) ?? 1,
        xp: getNumber(progression.xp, progression.experience, progression.experiencePoints, progression.experience_points, details.xp, player.xp) ?? 0,
        intel: intel.intel ?? 0,
        maxIntel: intel.maxIntel ?? 0,
        solaris: solarisCoin.total ?? 0,
        health: Math.round(vitals.currentHealth ?? 100),
        maxHealth: Math.round(vitals.maxHealth ?? 100),
        hydration: Math.round(vitals.hydration ?? 100),
        solarisCredit: getCurrencyValue(player.currency, details.currency, player.solarisCredit, player.solaris_credit, player.credit, player.credits),
        scrip: details.scrip ?? player.scrip ?? 0
    };
    const levelProgress = getLevelProgress(character.level, character.xp);
    const percent = (current, max)=>{
        const currentNumber = Number(current);
        const maxNumber = Number(max);
        if (!Number.isFinite(currentNumber) || !Number.isFinite(maxNumber) || maxNumber <= 0) {
            return 0;
        }
        return Math.max(0, Math.min(100, currentNumber / maxNumber * 100));
    };
    const isOnline = String(character.status).toLowerCase().includes('online');
    const ownedBases = bases.filter((base)=>isOwnedBase(base));
    const sharedBases = bases.filter((base)=>!isOwnedBase(base));
    const visibleBases = baseTab === 'owned' ? ownedBases : sharedBases;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: styles.page,
        className: "jsx-743e3fa734740a76",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalTabs, {
                activeTab: "Character"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1915,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: styles.container,
                className: "jsx-743e3fa734740a76",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 15,
                            marginBottom: 32,
                            flexWrap: 'wrap'
                        },
                        className: "jsx-743e3fa734740a76",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 13px',
                                    borderRadius: 999,
                                    backgroundColor: isOnline ? 'rgba(82,250,124,0.07)' : 'rgba(255,74,74,0.07)',
                                    border: `1px solid ${isOnline ? 'rgba(82,250,124,0.2)' : 'rgba(255,74,74,0.2)'}`
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: 8,
                                            height: 8,
                                            flexShrink: 0,
                                            borderRadius: '50%',
                                            backgroundColor: isOnline ? COLORS.green : COLORS.red,
                                            boxShadow: isOnline ? `
                      0 0 4px ${COLORS.green},
                      0 0 9px ${COLORS.green},
                      0 0 18px ${COLORS.green},
                      0 0 30px ${COLORS.green}
                    ` : `
                      0 0 4px ${COLORS.red},
                      0 0 9px ${COLORS.red},
                      0 0 18px ${COLORS.red},
                      0 0 30px ${COLORS.red}
                    `
                                        },
                                        className: "jsx-743e3fa734740a76" + " " + "portal-status-dot"
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 1948,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: isOnline ? '#8fffa9' : '#e58b8b',
                                            fontWeight: 700,
                                            fontSize: '0.72rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.7px'
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: character.status
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 1976,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1929,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/api/auth/logout",
                                style: {
                                    backgroundColor: COLORS.panel,
                                    color: COLORS.goldLight,
                                    border: `1px solid ${COLORS.border}`,
                                    padding: '8px 15px',
                                    borderRadius: 7,
                                    textDecoration: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 700
                                },
                                className: "jsx-743e3fa734740a76",
                                children: "Sign out"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 1993,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 1919,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 26
                        },
                        className: "jsx-743e3fa734740a76",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    textTransform: 'uppercase',
                                    letterSpacing: 2.5,
                                    color: COLORS.goldLight,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    margin: '0 0 7px'
                                },
                                className: "jsx-743e3fa734740a76",
                                children: "Arrakis Survivor Log"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2019,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: 'clamp(2rem, 7vw, 3rem)',
                                    margin: 0,
                                    fontFamily: 'Georgia, serif',
                                    color: COLORS.text,
                                    lineHeight: 1.05,
                                    wordBreak: 'break-word'
                                },
                                className: "jsx-743e3fa734740a76",
                                children: character.name
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2032,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 2014,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: 15,
                            marginBottom: 24
                        },
                        className: "jsx-743e3fa734740a76" + " " + "vitals-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...styles.panel,
                                    padding: 20
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.muted,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            marginBottom: 8
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: "Health"
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2066,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.text,
                                            fontSize: '1.35rem',
                                            fontWeight: 700,
                                            marginBottom: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            character.health,
                                            " /",
                                            ' ',
                                            character.maxHealth
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2080,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                        percent: percent(character.health, character.maxHealth),
                                        color: COLORS.red
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2092,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2060,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...styles.panel,
                                    padding: 20
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.muted,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            marginBottom: 8
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: "Hydration"
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2108,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.text,
                                            fontSize: '1.35rem',
                                            fontWeight: 700,
                                            marginBottom: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            character.hydration,
                                            " / 100"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                        percent: character.hydration,
                                        color: COLORS.blue
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2133,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2102,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    ...styles.panel,
                                    padding: 20
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.muted,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            marginBottom: 8
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: "Rank & Progress"
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2148,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
                                            gap: 10,
                                            marginBottom: 10
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: '#f3d39b',
                                                    fontSize: '1.15rem',
                                                    fontWeight: 700
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: [
                                                    "Level ",
                                                    character.level
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2170,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: COLORS.gold,
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: levelProgress.maxLevel ? 'MAX' : `${levelProgress.percent.toFixed(0)}%`
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2180,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2161,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                        percent: levelProgress.percent,
                                        color: COLORS.gold
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2193,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 10,
                                            marginTop: 7,
                                            color: COLORS.muted,
                                            fontSize: '0.68rem'
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-743e3fa734740a76",
                                                children: [
                                                    formatNumber(levelProgress.currentXp, 0),
                                                    " XP"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2208,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-743e3fa734740a76",
                                                children: levelProgress.maxLevel ? 'Level 200' : `${formatNumber(levelProgress.nextLevelXp, 0)} XP`
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2212,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2198,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.dim,
                                            fontSize: '0.68rem',
                                            marginTop: 7
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: levelProgress.maxLevel ? 'Maximum level reached' : `${formatNumber(levelProgress.remainingXp, 0)} XP to Level ${Number(character.level) + 1}`
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2222,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2142,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 2049,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            ...styles.panel,
                            padding: 22,
                            marginBottom: 24
                        },
                        className: "jsx-743e3fa734740a76",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    marginBottom: 18,
                                    paddingBottom: 13,
                                    borderBottom: `1px solid ${COLORS.borderLight}`
                                },
                                className: "jsx-743e3fa734740a76",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-743e3fa734740a76",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            style: styles.sectionTitle,
                                            className: "jsx-743e3fa734740a76",
                                            children: "Inventory & Assets"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/app/portal/page.js",
                                            lineNumber: 2263,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                color: COLORS.dim,
                                                fontSize: '0.7rem',
                                                margin: '4px 0 0'
                                            },
                                            className: "jsx-743e3fa734740a76",
                                            children: "Personal resources and financial assets"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/app/portal/page.js",
                                            lineNumber: 2271,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/dashboard/app/portal/page.js",
                                    lineNumber: 2262,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2249,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                    gap: 13
                                },
                                className: "jsx-743e3fa734740a76" + " " + "currency-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: 16,
                                            backgroundColor: '#ffffff04',
                                            border: `1px solid ${COLORS.borderLight}`,
                                            borderRadius: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: COLORS.muted,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: 7
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: "Solaris Coin"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2304,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: COLORS.gold,
                                                    fontSize: '1.15rem'
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: formatNumber(character.solaris, 0)
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2318,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2294,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: 16,
                                            backgroundColor: '#ffffff04',
                                            border: `1px solid ${COLORS.borderLight}`,
                                            borderRadius: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: COLORS.muted,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: 7
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: "Intel Bank"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2342,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: COLORS.textSoft,
                                                    fontSize: '1.15rem'
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: [
                                                    formatNumber(character.intel, 0),
                                                    ' ',
                                                    "/",
                                                    ' ',
                                                    formatNumber(character.maxIntel, 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2356,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2332,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: 16,
                                            backgroundColor: '#ffffff04',
                                            border: `1px solid ${COLORS.borderLight}`,
                                            borderRadius: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: COLORS.muted,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: 7
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: "Solaris Credit"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2385,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: COLORS.gold,
                                                    fontSize: '1.15rem'
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: formatNumber(character.solarisCredit, 0)
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2399,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: 16,
                                            backgroundColor: '#ffffff04',
                                            border: `1px solid ${COLORS.borderLight}`,
                                            borderRadius: 9
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: COLORS.muted,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    marginBottom: 7
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: "Scrip"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2423,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: COLORS.textSoft,
                                                    fontSize: '1.15rem'
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: formatNumber(character.scrip, 0)
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2437,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2413,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2284,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 2242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            ...styles.panel,
                            padding: 24,
                            marginBottom: 20
                        },
                        className: "jsx-743e3fa734740a76",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    gap: 15,
                                    flexWrap: 'wrap',
                                    marginBottom: 18
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    margin: '0 0 5px',
                                                    color: COLORS.goldLight,
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px'
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: "Territory Network"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2473,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                style: styles.sectionTitle,
                                                className: "jsx-743e3fa734740a76",
                                                children: "Bases"
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2488,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2472,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: COLORS.dim,
                                            fontSize: '0.72rem'
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            ownedBases.length,
                                            ' ',
                                            "owned ·",
                                            ' ',
                                            sharedBases.length,
                                            ' ',
                                            "shared"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2497,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2461,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                    gap: 8,
                                    padding: 5,
                                    marginBottom: 20,
                                    backgroundColor: '#0c0805',
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: 10
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setBaseTab('owned'),
                                        style: {
                                            appearance: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            borderRadius: 7,
                                            padding: '11px 14px',
                                            backgroundColor: baseTab === 'owned' ? 'rgba(210,168,90,0.12)' : 'transparent',
                                            color: baseTab === 'owned' ? COLORS.text : COLORS.dim,
                                            boxShadow: baseTab === 'owned' ? 'inset 0 0 0 1px rgba(210,168,90,0.16)' : 'none',
                                            fontSize: '0.76rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.6px'
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            "Own Bases",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    marginLeft: 7,
                                                    color: baseTab === 'owned' ? COLORS.gold : COLORS.dim
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: ownedBases.length
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2558,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2526,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setBaseTab('shared'),
                                        style: {
                                            appearance: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            borderRadius: 7,
                                            padding: '11px 14px',
                                            backgroundColor: baseTab === 'shared' ? 'rgba(125,184,232,0.1)' : 'transparent',
                                            color: baseTab === 'shared' ? '#b5d9f2' : COLORS.dim,
                                            boxShadow: baseTab === 'shared' ? 'inset 0 0 0 1px rgba(125,184,232,0.15)' : 'none',
                                            fontSize: '0.76rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.6px'
                                        },
                                        className: "jsx-743e3fa734740a76",
                                        children: [
                                            "Shared Bases",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    marginLeft: 7,
                                                    color: baseTab === 'shared' ? COLORS.water : COLORS.dim
                                                },
                                                className: "jsx-743e3fa734740a76",
                                                children: sharedBases.length
                                            }, void 0, false, {
                                                fileName: "[project]/dashboard/app/portal/page.js",
                                                lineNumber: 2603,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2571,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2511,
                                columnNumber: 11
                            }, this),
                            basesLoading && bases.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 9,
                                    marginBottom: 14,
                                    color: COLORS.dim,
                                    fontSize: '0.68rem'
                                },
                                className: "jsx-743e3fa734740a76",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: COLORS.gold,
                                            boxShadow: `
                      0 0 4px ${COLORS.gold},
                      0 0 8px ${COLORS.gold},
                      0 0 16px ${COLORS.gold},
                      0 0 24px ${COLORS.gold}
                    `
                                        },
                                        className: "jsx-743e3fa734740a76" + " " + "portal-status-dot"
                                    }, void 0, false, {
                                        fileName: "[project]/dashboard/app/portal/page.js",
                                        lineNumber: 2632,
                                        columnNumber: 17
                                    }, this),
                                    "Updating live telemetry..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2620,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BaseGrid, {
                                bases: visibleBases,
                                telemetry: basesTelemetry
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/portal/page.js",
                                lineNumber: 2654,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/portal/page.js",
                        lineNumber: 2453,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/portal/page.js",
                lineNumber: 1917,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "743e3fa734740a76",
                children: "@keyframes portalGlow{0%,to{opacity:.9;filter:brightness();transform:scale(1)}50%{opacity:1;filter:brightness(1.6);transform:scale(1.35)}}@keyframes portalGlowStrong{0%,to{opacity:.85;filter:brightness();transform:scale(1)}50%{opacity:1;filter:brightness(1.7);transform:scale(1.4)}}@keyframes portalSpin{to{transform:rotate(360deg)}}.portal-glow-dot.jsx-743e3fa734740a76{animation:2.2s ease-in-out infinite portalGlow}.portal-status-dot.jsx-743e3fa734740a76{animation:1.8s ease-in-out infinite portalGlowStrong}@media (width<=900px){.vitals-grid.jsx-743e3fa734740a76{grid-template-columns:1fr 1fr!important}.vitals-grid.jsx-743e3fa734740a76>div.jsx-743e3fa734740a76:last-child{grid-column:1/-1}.base-grid.jsx-743e3fa734740a76{grid-template-columns:1fr!important}.base-grid-last.jsx-743e3fa734740a76{grid-column:auto!important}}@media (width<=620px){.vitals-grid.jsx-743e3fa734740a76{grid-template-columns:1fr!important}.vitals-grid.jsx-743e3fa734740a76>div.jsx-743e3fa734740a76:last-child{grid-column:auto}.currency-grid.jsx-743e3fa734740a76{grid-template-columns:1fr!important}}@media (width>=901px){.base-grid-last.jsx-743e3fa734740a76{grid-column:1/-1}}@media (prefers-reduced-motion:reduce){.portal-glow-dot.jsx-743e3fa734740a76,.portal-status-dot.jsx-743e3fa734740a76{animation:none}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/app/portal/page.js",
        lineNumber: 1914,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=dashboard_app_portal_page_1zuweic.js.map