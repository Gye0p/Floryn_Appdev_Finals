/**
 * Real-time service using Symfony Mercure (Server-Sent Events).
 *
 * Flow:
 *  1. connect() — fetches a signed subscriber JWT from /api/customer/mercure-token
 *  2. Opens an EventSource to the Mercure hub URL with the JWT in the Authorization header
 *  3. Mercure pushes a JSON message whenever a reservation status changes on the backend
 *  4. onUpdate() callbacks fire → ReservationsScreen re-fetches its data instantly
 *
 * Auto-reconnect with exponential backoff (3 s → 6 s → 12 s → max 30 s).
 *
 * Paired with FCM push notifications:
 *  - App OPEN  → Mercure push catches changes in < 1 s
 *  - App CLOSED → FCM push notification alerts the user
 */

import EventSource from 'react-native-sse';
import { getMercureToken } from '../app/api/customerApi';
import { logError } from '../utils/logger';

type UpdateCallback = () => void;
type StatusCallback = (active: boolean) => void;

const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 3_000;

class RealtimeService {
    private es: InstanceType<typeof EventSource> | null = null;
    private updateCallbacks: Set<UpdateCallback> = new Set();
    private statusCallbacks: Set<StatusCallback> = new Set();
    private _isActive = false;
    private _shouldReconnect = false;
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private _reconnectDelay = BASE_RECONNECT_DELAY_MS;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Open the Mercure EventSource connection.
     * Safe to call multiple times — no-ops if already connected.
     */
    async connect(): Promise<void> {
        if (this._isActive || this.es) return;
        this._shouldReconnect = true;
        await this._openConnection();
    }

    /**
     * Close the Mercure EventSource and stop any reconnect attempts.
     */
    disconnect(): void {
        this._shouldReconnect = false;
        this._clearReconnectTimer();
        this._closeConnection();
        this._isActive = false;
        this._reconnectDelay = BASE_RECONNECT_DELAY_MS;
        this._notifyStatus(false);
        console.log('[Realtime] Disconnected from Mercure hub');
    }

    /** Subscribe to reservation update events. Returns an unsubscribe fn. */
    onUpdate(callback: UpdateCallback): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    /** Subscribe to connection status changes. Returns an unsubscribe fn. */
    onStatusChange(callback: StatusCallback): () => void {
        this.statusCallbacks.add(callback);
        return () => this.statusCallbacks.delete(callback);
    }

    isConnected(): boolean {
        return this._isActive;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private async _openConnection(): Promise<void> {
        try {
            // 1. Fetch a fresh signed subscriber JWT from the backend
            const { token, hub_url, topic } = await getMercureToken();

            // 2. Build the Mercure subscription URL
            //    topic is passed as a query param; JWT goes in the Authorization header
            const url = `${hub_url}?topic=${encodeURIComponent(topic)}`;

            console.log(`[Realtime] Connecting to Mercure hub… topic=${topic}`);

            // 3. Open EventSource
            this.es = new EventSource(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 4. Connection established
            this.es.addEventListener('open', () => {
                console.log('[Realtime] Connected to Mercure hub ✓');
                this._isActive = true;
                this._reconnectDelay = BASE_RECONNECT_DELAY_MS; // reset backoff
                this._notifyStatus(true);
            });

            // 5. Server pushed a message
            this.es.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse((event as MessageEvent).data ?? '{}');
                    console.log('[Realtime] Mercure event received:', data.event);

                    if (
                        data.event === 'reservation_updated' ||
                        data.event === 'reservation_created'
                    ) {
                        this._notifyUpdate();
                    }
                } catch {
                    // Ignore malformed messages
                }
            });

            // 6. Connection lost — schedule reconnect with backoff
            this.es.addEventListener('error', (err) => {
                console.warn('[Realtime] Mercure connection error, will reconnect…', err);
                this._isActive = false;
                this._notifyStatus(false);
                this._closeConnection();

                if (this._shouldReconnect) {
                    this._scheduleReconnect();
                }
            });
        } catch (error) {
            logError('Realtime: failed to open Mercure connection', error);
            this._isActive = false;
            this._notifyStatus(false);

            if (this._shouldReconnect) {
                this._scheduleReconnect();
            }
        }
    }

    private _closeConnection(): void {
        if (this.es) {
            this.es.close();
            this.es = null;
        }
    }

    private _scheduleReconnect(): void {
        console.log(`[Realtime] Reconnecting in ${this._reconnectDelay / 1000}s…`);
        this._reconnectTimer = setTimeout(async () => {
            this._reconnectTimer = null;
            if (this._shouldReconnect) {
                await this._openConnection();
            }
        }, this._reconnectDelay);

        // Exponential backoff, capped at MAX_RECONNECT_DELAY_MS
        this._reconnectDelay = Math.min(
            this._reconnectDelay * 2,
            MAX_RECONNECT_DELAY_MS,
        );
    }

    private _clearReconnectTimer(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }

    private _notifyUpdate(): void {
        this.updateCallbacks.forEach(cb => cb());
    }

    private _notifyStatus(active: boolean): void {
        this.statusCallbacks.forEach(cb => cb(active));
    }
}

// Export as singleton
export const websocketService = new RealtimeService();
