declare global {
    interface Window {
        COUNTER_PATH?: string;
    }
}

type Callback<T> = (data: T) => void;
type Params = Record<string, string | number | boolean>;

interface BeatmapFilePath {
    filePath: string;
}

class WebSocketManager {
    version = "0.1.4";
    private host: string;
    private sockets: Record<string, WebSocket>;

    constructor(host: string) {
        this.host = host;
        this.sockets = {};
        this.createConnection = this.createConnection.bind(this);
    }

    private createConnection<T>(url: string, callback: Callback<T>, filters?: Filters): void {
        let interval: number | undefined;
        const counterPath = window.COUNTER_PATH || "";
        const fullUrl = `ws://${this.host}${url}?l=${encodeURI(counterPath)}`;
        this.sockets[url] = new WebSocket(fullUrl);

        this.sockets[url].onopen = () => {
            console.log(`[OPEN] ${url}: Connected`);
            if (interval) clearInterval(interval);
            if (filters) {
                this.sockets[url].send(`applyFilters:${JSON.stringify(filters)}`);
            }
        };

        this.sockets[url].onclose = (event) => {
            console.log(`[CLOSED] ${url}: ${event.reason}`);
            delete this.sockets[url];
            interval = window.setTimeout(() => {
                this.createConnection(url, callback, filters);
            }, 1000);
        };

        this.sockets[url].onerror = (event) => {
            console.error(`[ERROR] ${url}:`, event);
        };

        this.sockets[url].onmessage = (event) => {
            try {
                const data: T = JSON.parse(event.data);
                if (data && typeof data === "object" && "error" in data) {
                    console.error(`[MESSAGE_ERROR] ${url}:`, data.error);
                    return;
                }
                callback(data);
            } catch (error) {
                console.error(`[MESSAGE_ERROR] ${url}: Couldn't parse incoming message`, error);
            }
        };
    }

    api_v2<T>(callback: Callback<T>, filters?: Filters): void {
        this.createConnection("/websocket/v2", callback, filters);
    }

    api_v2_precise<T>(callback: Callback<T>, filters?: Filters): void {
        this.createConnection("/websocket/v2/precise", callback, filters);
    }

    async calculate_pp(params: Params): Promise<unknown> {
        try {
            const url = new URL(`http://${this.host}/api/calculate/pp`);
            Object.keys(params).forEach((key) => url.searchParams.append(key, String(params[key])));

            const request = await fetch(url.toString(), { method: "GET" });
            const json = await request.json();
            return json;
        } catch (error) {
            console.error(error);
            return { error: (<Error>error).message };
        }
    }

    async getBeatmapOsuFile({ filePath }: BeatmapFilePath): Promise<string | { error: string }> {
        try {
            const request = await fetch(`${this.host}/files/beatmap/${filePath}`, {
                method: "GET",
            });
            const text = await request.text();
            return text;
        } catch (error) {
            console.error(error);
            return { error: (<Error>error).message };
        }
    }

    commands<T>(callback: Callback<T>): void {
        this.createConnection("/websocket/commands", callback);
    }

    sendCommand(name: string, command: string | Record<string, unknown>, amountOfRetries = 1): void {
        if (!this.sockets["/websocket/commands"]) {
            setTimeout(() => {
                this.sendCommand(name, command, amountOfRetries + 1);
            }, 100);
            return;
        }

        try {
            const payload = typeof command === "object" ? JSON.stringify(command) : command;
            this.sockets["/websocket/commands"].send(`${name}:${payload}`);
        } catch (error) {
            if (amountOfRetries <= 3) {
                console.log(`[COMMAND_ERROR] Attempt ${amountOfRetries}`, error);
                setTimeout(() => {
                    this.sendCommand(name, command, amountOfRetries + 1);
                }, 1000);
                return;
            }
            console.error("[COMMAND_ERROR]", error);
        }
    }

    close(url: string): void {
        this.host = url;
        Object.values(this.sockets).forEach((socket) => {
            if (socket) socket.close();
        });
    }
}

export default WebSocketManager;

type Filters = string | { field: string; keys: Filters[] };
