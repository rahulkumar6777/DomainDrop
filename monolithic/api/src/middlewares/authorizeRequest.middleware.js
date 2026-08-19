import { API_KEY_SCOPES } from "../models/apikeys.model.js";


const sendError = (res, status, message, extra = {}) => {
    return res.status(status).json({ success: false, message, ...extra });
};


export const requireScopes = (...requiredScopes) => {

    if (requiredScopes.length === 0) {
        throw new TypeError("requireScopes needs at least one scope");
    }


    const invalidScopes = requiredScopes.filter(
        (scope) => !API_KEY_SCOPES.includes(scope),
    );
    if (invalidScopes.length > 0) {
        throw new TypeError(`Unknown API key scope: ${invalidScopes.join(", ")}`);
    }

    return function authorizeScopes(req, res, next) {
        if (!req.auth) {
            return sendError(res, 401, "Authentication required");
        }

        if (req.auth.type === "jwt") {
            return next();
        }

        if (req.auth.type !== "api-key") {
            return sendError(res, 401, "Invalid authentication context");
        }

        const grantedScopes = new Set(req.auth.scopes ?? []);
        const missingScopes = requiredScopes.filter(
            (scope) => !grantedScopes.has(scope),
        );

        if (missingScopes.length > 0) {
            return sendError(res, 403, "API key does not have the required scope", {
                missingScopes,
            });
        }

        return next();
    };
};


export const requireScope = (requiredScope) => requireScopes(requiredScope);
