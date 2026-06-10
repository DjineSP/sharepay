export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
};

export type StoredUserInfo = {
    accountId: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    kycLevel: string;
};

export type TokenPersistMode = "local" | "session";

const KEYS = {
    ACCESS: "sharepay.access_token",
    REFRESH: "sharepay.refresh_token",
    TYPE: "sharepay.token_type",
    PERSIST: "sharepay.persist_mode",
    USER: "sharepay.user_info",
} as const;

const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
    getPersistMode(): TokenPersistMode {
        if (!isBrowser()) return "session";
        return (localStorage.getItem(KEYS.PERSIST) as TokenPersistMode) ?? "session";
    },

    get(): AuthTokens | null {
        if (!isBrowser()) return null;
        const storage = this.getPersistMode() === "local" ? localStorage : sessionStorage;
        const accessToken = storage.getItem(KEYS.ACCESS);
        const refreshToken = storage.getItem(KEYS.REFRESH);
        const tokenType = storage.getItem(KEYS.TYPE) ?? "Bearer";
        if (!accessToken || !refreshToken) {
            // Cookie may survive sessionStorage being cleared (browser session restore).
            // Clear it here so the middleware doesn't redirect to the dashboard when there
            // are no tokens - which would cause an infinite redirect loop.
            document.cookie = "sharepay_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
            return null;
        }
        return { accessToken, refreshToken, tokenType };
    },

    set(tokens: AuthTokens, options?: { persist?: boolean }) {
        if (!isBrowser()) return;
        const persist = options?.persist ?? (this.getPersistMode() === "local");
        const target = persist ? localStorage : sessionStorage;
        const other = persist ? sessionStorage : localStorage;

        this._clearStorage(other);

        target.setItem(KEYS.PERSIST, persist ? "local" : "session");
        target.setItem(KEYS.ACCESS, tokens.accessToken);
        target.setItem(KEYS.REFRESH, tokens.refreshToken);
        target.setItem(KEYS.TYPE, tokens.tokenType);

        const cookieName = "sharepay_session";
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        const sameSite = "; SameSite=Strict";
        let expires = "";
        if (persist) {
            const date = new Date();
            date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${cookieName}=true${expires}; path=/${secure}${sameSite}`;
    },

    setUser(user: StoredUserInfo) {
        if (!isBrowser()) return;
        const storage = this.getPersistMode() === "local" ? localStorage : sessionStorage;
        storage.setItem(KEYS.USER, JSON.stringify(user));
    },

    getUser(): StoredUserInfo | null {
        if (!isBrowser()) return null;
        const storage = this.getPersistMode() === "local" ? localStorage : sessionStorage;
        const raw = storage.getItem(KEYS.USER);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    },

    clear() {
        if (!isBrowser()) return;
        this._clearStorage(localStorage);
        this._clearStorage(sessionStorage);
        document.cookie = "sharepay_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    },

    getAuthorizationHeader(): string | null {
        const tokens = this.get();
        if (!tokens) return null;
        return `${tokens.tokenType} ${tokens.accessToken}`;
    },

    _clearStorage(storage: Storage) {
        storage.removeItem(KEYS.ACCESS);
        storage.removeItem(KEYS.REFRESH);
        storage.removeItem(KEYS.TYPE);
        storage.removeItem(KEYS.PERSIST);
        storage.removeItem(KEYS.USER);
    },
};
