module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/dashboard/app/dashboard/OwnerDashboard.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/dashboard/app/dashboard/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/app/lib/auth.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$dashboard$2f$OwnerDashboard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/app/dashboard/OwnerDashboard.js [app-rsc] (ecmascript)");
;
;
;
;
async function DashboardPage() {
    const owner = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isOwner"])();
    console.log('[DASHBOARD] Owner access:', owner);
    if (!owner) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/portal');
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$dashboard$2f$OwnerDashboard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/dashboard/app/dashboard/page.js",
        lineNumber: 14,
        columnNumber: 10
    }, this);
}
}),
"[project]/dashboard/app/dashboard/page.js [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/dashboard/app/dashboard/page.js [app-rsc] (ecmascript)"));
}),
"[project]/dashboard/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.1vfb8ia0w-1kw.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/dashboard/app/favicon.ico.mjs { IMAGE => \"[project]/dashboard/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/dashboard/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 32,
    height: 32
};
}),
"[project]/dashboard/app/lib/auth.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSession",
    ()=>getSession,
    "isOwner",
    ()=>isOwner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
if (!/*TURBOPACK member replacement*/ __turbopack_context__.g.dashboardSessions) {
    /*TURBOPACK member replacement*/ __turbopack_context__.g.dashboardSessions = new Map();
}
const sessions = /*TURBOPACK member replacement*/ __turbopack_context__.g.dashboardSessions;
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionId = cookieStore.get('dashboard_session')?.value;
    if (!sessionId) {
        console.log('[AUTH] No dashboard_session cookie');
        return null;
    }
    const session = sessions.get(sessionId);
    if (!session) {
        console.log('[AUTH] Session not found');
        return null;
    }
    if (session.expiresAt && session.expiresAt < Date.now()) {
        console.log('[AUTH] Session expired');
        sessions.delete(sessionId);
        return null;
    }
    return session;
}
async function isOwner() {
    const session = await getSession();
    if (!session) {
        console.log('[AUTH] No session');
        return false;
    }
    const ownerRoleId = process.env.OWNER_ROLE_ID;
    if (!ownerRoleId) {
        console.error('[AUTH] OWNER_ROLE_ID is missing from environment');
        return false;
    }
    const roles = Array.isArray(session.roleIds) ? session.roleIds : [];
    const owner = roles.includes(ownerRoleId);
    console.log('[AUTH] Owner check:', {
        userId: session.user?.id,
        roleCount: roles.length,
        ownerRoleId,
        owner
    });
    return owner;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0nfzuzu._.js.map