(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "generateId",
    ()=>generateId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/WebSocketContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebSocketProvider",
    ()=>WebSocketProvider,
    "useWebSocket",
    ()=>useWebSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const WebSocketContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const BACKEND_URL = ("TURBOPACK compile-time value", "http://localhost:8000") || "http://localhost:8000";
function WebSocketProvider({ children }) {
    _s();
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [connectionError, setConnectionError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [mode, setModeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("sandbox");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [coachFeedback, setCoachFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentVideo, setCurrentVideo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleIncomingMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[handleIncomingMessage]": (message)=>{
            switch(message.type){
                case "transcript":
                    const newMessage = {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateId"])(),
                        speaker: message.data.speaker,
                        text: message.data.text,
                        timestamp: new Date()
                    };
                    setMessages({
                        "WebSocketProvider.useCallback[handleIncomingMessage]": (prev)=>[
                                ...prev,
                                newMessage
                            ]
                    }["WebSocketProvider.useCallback[handleIncomingMessage]"]);
                    break;
                case "video":
                    setCurrentVideo(message.data);
                    break;
                case "coach":
                    setCoachFeedback({
                        ...message.data,
                        timestamp: new Date()
                    });
                    break;
                case "status":
                    setStatus(message.data);
                    break;
            }
        }
    }["WebSocketProvider.useCallback[handleIncomingMessage]"], []);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[connect]": ()=>{
            if (socketRef.current?.connected) return;
            const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(BACKEND_URL, {
                transports: [
                    "websocket"
                ],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            socket.on("connect", {
                "WebSocketProvider.useCallback[connect]": ()=>{
                    setIsConnected(true);
                    setConnectionError(null);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("disconnect", {
                "WebSocketProvider.useCallback[connect]": ()=>setIsConnected(false)
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("connect_error", {
                "WebSocketProvider.useCallback[connect]": (err)=>{
                    setConnectionError(`Connection failed: ${err.message}`);
                    setIsConnected(false);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("message", handleIncomingMessage);
            socketRef.current = socket;
        }
    }["WebSocketProvider.useCallback[connect]"], [
        handleIncomingMessage
    ]);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[disconnect]": ()=>{
            socketRef.current?.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }["WebSocketProvider.useCallback[disconnect]"], []);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[sendMessage]": (message)=>{
            if (socketRef.current?.connected) {
                socketRef.current.emit("message", message);
            }
        }
    }["WebSocketProvider.useCallback[sendMessage]"], []);
    const sendAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[sendAudio]": (base64)=>{
            sendMessage({
                type: "audio",
                data: base64
            });
        }
    }["WebSocketProvider.useCallback[sendAudio]"], [
        sendMessage
    ]);
    const setMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[setMode]": (newMode)=>{
            setModeState(newMode);
            sendMessage({
                type: "mode",
                data: newMode
            });
            setMessages([]);
            setCoachFeedback(null);
            setCurrentVideo(null);
        }
    }["WebSocketProvider.useCallback[setMode]"], [
        sendMessage
    ]);
    const setScenario = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[setScenario]": (scenario)=>{
            sendMessage({
                type: "scenario",
                data: scenario
            });
            setMessages([]);
            setCoachFeedback(null);
        }
    }["WebSocketProvider.useCallback[setScenario]"], [
        sendMessage
    ]);
    const setSandboxConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[setSandboxConfig]": (persona, context)=>{
            sendMessage({
                type: "sandbox_config",
                data: {
                    persona,
                    context
                }
            });
        }
    }["WebSocketProvider.useCallback[setSandboxConfig]"], [
        sendMessage
    ]);
    const bargeIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[bargeIn]": ()=>{
            sendMessage({
                type: "barge_in",
                data: true
            });
        }
    }["WebSocketProvider.useCallback[bargeIn]"], [
        sendMessage
    ]);
    const startDebate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[startDebate]": ()=>{
            sendMessage({
                type: "start_debate",
                data: true
            });
        }
    }["WebSocketProvider.useCallback[startDebate]"], [
        sendMessage
    ]);
    const stopDebate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[stopDebate]": ()=>{
            sendMessage({
                type: "stop_debate",
                data: true
            });
        }
    }["WebSocketProvider.useCallback[stopDebate]"], [
        sendMessage
    ]);
    const clearMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[clearMessages]": ()=>{
            setMessages([]);
            setCoachFeedback(null);
            setCurrentVideo(null);
        }
    }["WebSocketProvider.useCallback[clearMessages]"], []);
    const addMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[addMessage]": (speaker, text)=>{
            setMessages({
                "WebSocketProvider.useCallback[addMessage]": (prev)=>[
                        ...prev,
                        {
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateId"])(),
                            speaker,
                            text,
                            timestamp: new Date()
                        }
                    ]
            }["WebSocketProvider.useCallback[addMessage]"]);
        }
    }["WebSocketProvider.useCallback[addMessage]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebSocketProvider.useEffect": ()=>{
            return ({
                "WebSocketProvider.useEffect": ()=>disconnect()
            })["WebSocketProvider.useEffect"];
        }
    }["WebSocketProvider.useEffect"], [
        disconnect
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WebSocketContext.Provider, {
        value: {
            isConnected,
            connectionError,
            status,
            mode,
            messages,
            coachFeedback,
            currentVideo,
            sendAudio,
            setMode,
            setScenario,
            setSandboxConfig,
            bargeIn,
            startDebate,
            stopDebate,
            clearMessages,
            addMessage,
            connect,
            disconnect
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/WebSocketContext.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
}
_s(WebSocketProvider, "9xEaH8kjhbNB3+zh6CgzSnqvZ6k=");
_c = WebSocketProvider;
function useWebSocket() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WebSocketContext);
    if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
    return context;
}
_s1(useWebSocket, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "WebSocketProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_3ecfd286._.js.map