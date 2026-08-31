module.exports = [
"[project]/dashboard/app/dashboard/page.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OwnerDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function OwnerDashboard() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        uptime: '...',
        memoryMb: '...',
        shards: [],
        guilds: []
    });
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [restarting, setRestarting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function refreshStats() {
        try {
            const res = await fetch('/api/stats', {
                method: 'GET',
                cache: 'no-store'
            });
            // Session expired or user no longer has owner access.
            if (res.status === 401 || res.status === 403) {
                router.replace('/portal');
                return;
            }
            if (!res.ok) {
                console.error('Stats request failed:', res.status);
                return;
            }
            const data = await res.json();
            setStats({
                uptime: data.uptime ?? '...',
                memoryMb: data.memoryMb ?? '...',
                shards: Array.isArray(data.shards) ? data.shards : [],
                guilds: Array.isArray(data.guilds) ? data.guilds : []
            });
        } catch (err) {
            console.error('Failed to fetch telemetry data:', err);
        } finally{
            setLoading(false);
        }
    }
    async function restartBot() {
        if (restarting) return;
        const confirmed = window.confirm('Are you sure you want to request a bot restart?');
        if (!confirmed) return;
        setRestarting(true);
        try {
            const res = await fetch('/api/control/restart', {
                method: 'POST'
            });
            // User is no longer authorized.
            if (res.status === 401 || res.status === 403) {
                alert('You are no longer authorized to use the control center.');
                router.replace('/portal');
                return;
            }
            if (res.ok) {
                alert('Restart request submitted successfully.');
            } else {
                let message = 'Failed to submit restart request.';
                try {
                    const data = await res.json();
                    if (data?.error) {
                        message = data.error;
                    }
                } catch  {
                // Response was not JSON.
                }
                alert(message);
            }
        } catch (err) {
            console.error('Error submitting bot control command:', err);
            alert('Unable to contact the control server.');
        } finally{
            setRestarting(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshStats();
        const interval = setInterval(()=>{
            refreshStats();
        }, 15000);
        return ()=>clearInterval(interval);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            maxWidth: '800px',
            margin: '40px auto',
            padding: '0 20px',
            fontFamily: 'system-ui, sans-serif'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            backgroundColor: '#ff4a4a',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        },
                        children: "OWNER ACCESS"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/api/auth/logout",
                        style: {
                            color: '#cda26b',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        },
                        children: "Sign out"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#cda26b',
                    fontSize: '0.85rem',
                    margin: '0 0 5px 0'
                },
                children: "Arrakis Control Center"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    fontSize: '2.2rem',
                    margin: '0 0 25px 0'
                },
                children: "System Administration"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    backgroundColor: '#1d120c',
                    border: '1px solid #3c2415',
                    padding: '20px',
                    borderRadius: '6px',
                    marginBottom: '30px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            height: '12px',
                            width: '12px',
                            backgroundColor: '#52fa7c',
                            borderRadius: '50%',
                            display: 'inline-block',
                            boxShadow: '0 0 8px #52fa7c'
                        }
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    display: 'block',
                                    color: '#f3d39b'
                                },
                                children: "Systems Live"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                style: {
                                    color: '#a08568'
                                },
                                children: "Telemetry maps refreshing automatically every 15s"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 209,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '15px',
                    marginBottom: '40px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            backgroundColor: '#1d120c',
                            border: '1px solid #2a1a0f',
                            padding: '15px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    display: 'block',
                                    color: '#a08568',
                                    fontSize: '0.85rem',
                                    marginBottom: '5px'
                                },
                                children: "Uptime"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 237,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    color: '#f3d39b'
                                },
                                children: stats.uptime
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 248,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 228,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            backgroundColor: '#1d120c',
                            border: '1px solid #2a1a0f',
                            padding: '15px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    display: 'block',
                                    color: '#a08568',
                                    fontSize: '0.85rem',
                                    marginBottom: '5px'
                                },
                                children: "Memory"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    color: '#f3d39b'
                                },
                                children: [
                                    stats.memoryMb,
                                    " MB"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 279,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            backgroundColor: '#1d120c',
                            border: '1px solid #2a1a0f',
                            padding: '15px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    display: 'block',
                                    color: '#a08568',
                                    fontSize: '0.85rem',
                                    marginBottom: '5px'
                                },
                                children: "Active Shards"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    color: '#f3d39b'
                                },
                                children: stats.shards.length
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 310,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 290,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: '1.3rem',
                    color: '#cda26b',
                    borderBottom: '1px solid #23150d',
                    paddingBottom: '8px',
                    marginBottom: '15px'
                },
                children: "Connected Guilds"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 323,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '40px'
                },
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: '#a08568',
                        fontStyle: 'italic'
                    },
                    children: "Querying discord guild registry..."
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/dashboard/page.js",
                    lineNumber: 344,
                    columnNumber: 11
                }, this) : stats.guilds.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: '#a08568'
                    },
                    children: "No connected guilds found."
                }, void 0, false, {
                    fileName: "[project]/dashboard/app/dashboard/page.js",
                    lineNumber: 353,
                    columnNumber: 11
                }, this) : stats.guilds.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            backgroundColor: '#160d08',
                            border: '1px solid #23150d',
                            padding: '15px',
                            borderRadius: '4px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                style: {
                                    display: 'block',
                                    color: '#f3d39b',
                                    marginBottom: '4px'
                                },
                                children: g.name
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 371,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                style: {
                                    color: '#a08568'
                                },
                                children: [
                                    g.memberCount,
                                    " members"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/dashboard/app/dashboard/page.js",
                                lineNumber: 381,
                                columnNumber: 15
                            }, this)
                        ]
                    }, g.id, true, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 362,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 335,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: '1.3rem',
                    color: '#cda26b',
                    borderBottom: '1px solid #23150d',
                    paddingBottom: '8px',
                    marginBottom: '15px'
                },
                children: "Subsystem Actions"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 394,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/portal",
                        style: {
                            display: 'inline-block',
                            border: '1px solid #cda26b',
                            color: '#cda26b',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        },
                        children: "Open My Player Portal →"
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 413,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: restartBot,
                        disabled: restarting,
                        style: {
                            backgroundColor: restarting ? '#6b3030' : '#ff4a4a',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: restarting ? 'not-allowed' : 'pointer',
                            opacity: restarting ? 0.7 : 1
                        },
                        children: restarting ? 'Restart Requesting...' : 'Restart Core Bot Process'
                    }, void 0, false, {
                        fileName: "[project]/dashboard/app/dashboard/page.js",
                        lineNumber: 429,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/dashboard/app/dashboard/page.js",
                lineNumber: 406,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/app/dashboard/page.js",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=dashboard_app_dashboard_page_08mvqmw.js.map