(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/context/WebSocketContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebSocketProvider",
    ()=>WebSocketProvider,
    "useSocket",
    ()=>useSocket,
    "useWebSocket",
    ()=>useWebSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
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
    const [mode, setModeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("dojo");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [coachFeedback, setCoachFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentVideo, setCurrentVideo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleIncomingMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[handleIncomingMessage]": (message)=>{
            switch(message.type){
                case "transcript":
                    const newMessage = {
                        id: crypto.randomUUID(),
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
                case "audio":
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
                    console.log("Connected to backend");
                    setIsConnected(true);
                    setConnectionError(null);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("disconnect", {
                "WebSocketProvider.useCallback[connect]": ()=>{
                    console.log("Disconnected from backend");
                    setIsConnected(false);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("connect_error", {
                "WebSocketProvider.useCallback[connect]": (err)=>{
                    console.error("Connection error:", err);
                    setConnectionError(`Failed to connect: ${err.message}`);
                    setIsConnected(false);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socket.on("message", {
                "WebSocketProvider.useCallback[connect]": (data)=>{
                    handleIncomingMessage(data);
                }
            }["WebSocketProvider.useCallback[connect]"]);
            // Specific event for audio to allow direct handling
            socket.on("audio", {
                "WebSocketProvider.useCallback[connect]": (data)=>{
                // This will be picked up by the useEffect in the component
                }
            }["WebSocketProvider.useCallback[connect]"]);
            socketRef.current = socket;
        }
    }["WebSocketProvider.useCallback[connect]"], [
        handleIncomingMessage
    ]);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[disconnect]": ()=>{
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
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
            setMessages([]); // Clear messages when switching modes
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
            setMessages([]); // Clear messages when switching scenarios
            setCoachFeedback(null);
            setCurrentVideo(null);
        }
    }["WebSocketProvider.useCallback[setScenario]"], [
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
    const clearMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[clearMessages]": ()=>{
            setMessages([]);
            setCoachFeedback(null);
            setCurrentVideo(null);
        }
    }["WebSocketProvider.useCallback[clearMessages]"], []);
    // Get socket for direct audio event listening
    const getSocket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebSocketProvider.useCallback[getSocket]": ()=>socketRef.current
    }["WebSocketProvider.useCallback[getSocket]"], []);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebSocketProvider.useEffect": ()=>{
            return ({
                "WebSocketProvider.useEffect": ()=>{
                    disconnect();
                }
            })["WebSocketProvider.useEffect"];
        }
    }["WebSocketProvider.useEffect"], [
        disconnect
    ]);
    const value = {
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
        bargeIn,
        clearMessages,
        connect,
        disconnect
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WebSocketContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/WebSocketContext.tsx",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
_s(WebSocketProvider, "h5Il/NSTGQ3SjoKDpAHUYVqpYPU=");
_c = WebSocketProvider;
function useWebSocket() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
_s1(useWebSocket, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function useSocket() {
    _s2();
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return socketRef.current;
}
_s2(useSocket, "NDhsKEOklSQv0UiXoatqsJ0f56M=");
var _c;
__turbopack_context__.k.register(_c, "WebSocketProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_context_WebSocketContext_tsx_38de7b58._.js.map