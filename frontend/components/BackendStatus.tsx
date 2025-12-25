"use client"
import { useState, useEffect } from "react";
import { checkBackendHealth } from "@/lib/config";

export default function BackendStatus() {
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            setIsChecking(true);
            const isOnline = await checkBackendHealth();
            setIsBackendOnline(isOnline);
            setIsChecking(false);
        };

        checkStatus();

        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    if (isChecking) {
        return (
            <div className="backend-status checking">
                <span>🔄 Checking backend...</span>
            </div>
        );
    }

    return (
        <div className={`backend-status ${isBackendOnline ? 'online' : 'offline'}`}>
            {isBackendOnline ? (
                <span>✅ IPFS Backend Online</span>
            ) : (
                <span>❌ IPFS Backend Offline</span>
            )}
        </div>
    );
}