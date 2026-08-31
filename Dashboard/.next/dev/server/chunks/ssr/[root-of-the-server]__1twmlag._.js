module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/dashboard/app/dashboard/page.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var e = new Error("Could not parse module '[project]/dashboard/app/dashboard/page.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1twmlag._.js.map