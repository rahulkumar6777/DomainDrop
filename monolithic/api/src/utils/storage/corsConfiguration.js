import { envs } from "../../lib/env.js";
import { STORAGE_CORS_LIMITS, STORAGE_CORS_METHODS, createDefaultStorageCorsConfiguration, } from "../../constant/storageCors.js";



const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const CORS_FIELDS = new Set([
    "allowedOrigins",
    "allowedMethods",
    "allowedHeaders",
    "exposeHeaders",
    "maxAgeSeconds",
]);



const unique = (values) => [...new Set(values)];

export const normalizeCorsOrigin = (value, { allowWildcard = true } = {}) => {

    if (typeof value !== "string" || !value.trim()) {
        throw new TypeError("Every allowed origin must be a non-empty string");
    }

    const origin = value.trim();
    if (origin.length > 255) {
        throw new TypeError("Allowed origins cannot be longer than 255 characters");
    }

    if (origin === "*") {
        if (!allowWildcard) {
            throw new TypeError("The default CORS origin cannot use a wildcard");
        }
        return origin;
    }

    const hasWildcard = origin.includes("*");
    if (hasWildcard && (!allowWildcard || !/^https?:\/\/\*\.[^*/]+(?::\d+)?\/?$/i.test(origin))) {
        throw new TypeError("Wildcard origins must look like https://*.example.com");
    }

    const parseableOrigin = hasWildcard ? origin.replace("://*.", "://cors-wildcard.") : origin;

    let parsed;
    try {
        parsed = new URL(parseableOrigin);
    } catch {
        throw new TypeError("Every allowed origin must be a valid HTTP or HTTPS origin");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new TypeError("Allowed origins must use HTTP or HTTPS");
    }

    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
        throw new TypeError("Allowed origins cannot include credentials, a path, query, or fragment");
    }

    if (!hasWildcard) {
        return parsed.origin;
    }

    const hostname = parsed.hostname.replace(/^cors-wildcard\./, "");
    const port = parsed.port ? `:${parsed.port}` : "";
    return `${parsed.protocol}//*.${hostname}${port}`;
};

const normalizeHeaders = (value, fieldName, fallback) => {
    const headers = value ?? fallback;
    if (!Array.isArray(headers) || headers.length > STORAGE_CORS_LIMITS.maxHeaders) {
        throw new TypeError(`${fieldName} must be an array with at most ${STORAGE_CORS_LIMITS.maxHeaders} values`);
    }

    const normalized = headers.map((header) => {
        if (typeof header !== "string" || !HEADER_NAME_PATTERN.test(header.trim()) || header.trim().length > 128) {
            throw new TypeError(`${fieldName} contains an invalid header name`);
        }
        return header.trim();
    });

    if (unique(normalized.map((header) => header.toLowerCase())).length !== normalized.length) {
        throw new TypeError(`${fieldName} cannot contain duplicate header names`);
    }

    return normalized;
};

export const getDefaultCorsOrigin = () => normalizeCorsOrigin(
    envs.FRONTEND_URI,
    { allowWildcard: false },
);

export const normalizeStorageCorsConfiguration = (value = {}) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("CORS configuration must be an object");
    }

    const unknownField = Object.keys(value).find((field) => !CORS_FIELDS.has(field));
    if (unknownField) {
        throw new TypeError(`${unknownField} is not a supported CORS setting`);
    }

    const defaults = createDefaultStorageCorsConfiguration();
    const origins = value.allowedOrigins ?? defaults.allowedOrigins;
    if (!Array.isArray(origins) || origins.length > STORAGE_CORS_LIMITS.maxOrigins) {
        throw new TypeError(`allowedOrigins must be an array with at most ${STORAGE_CORS_LIMITS.maxOrigins} values`);
    }

    const allowedOrigins = unique(origins.map((origin) => normalizeCorsOrigin(origin)));
    if (allowedOrigins.length !== origins.length) {
        throw new TypeError("allowedOrigins cannot contain duplicate origins");
    }

    const methods = value.allowedMethods ?? defaults.allowedMethods;
    if (!Array.isArray(methods) || methods.length < 1 || methods.length > STORAGE_CORS_METHODS.length) {
        throw new TypeError("allowedMethods must be a non-empty array");
    }

    const allowedMethods = unique(methods.map((method) => String(method).toUpperCase()));
    if (
        allowedMethods.length !== methods.length
        || allowedMethods.some((method) => !STORAGE_CORS_METHODS.includes(method))
    ) {
        throw new TypeError(`allowedMethods can only contain ${STORAGE_CORS_METHODS.join(", ")}`);
    }

    const maxAgeSeconds = value.maxAgeSeconds ?? defaults.maxAgeSeconds;
    if (
        !Number.isSafeInteger(maxAgeSeconds)
        || maxAgeSeconds < 0
        || maxAgeSeconds > STORAGE_CORS_LIMITS.maxAgeSeconds
    ) {
        throw new TypeError(`maxAgeSeconds must be an integer from 0 to ${STORAGE_CORS_LIMITS.maxAgeSeconds}`);
    }

    return {
        allowedOrigins,
        allowedMethods,
        allowedHeaders: normalizeHeaders(value.allowedHeaders, "allowedHeaders", defaults.allowedHeaders),
        exposeHeaders: normalizeHeaders(value.exposeHeaders, "exposeHeaders", defaults.exposeHeaders),
        maxAgeSeconds,
    };
};

export const normalizeUserStorageCorsConfiguration = (value = {}) => {
    const configuration = normalizeStorageCorsConfiguration(value);
    const defaultOrigin = getDefaultCorsOrigin();

    return {
        ...configuration,
        allowedOrigins: configuration.allowedOrigins.filter((origin) => origin !== defaultOrigin),
    };
};
