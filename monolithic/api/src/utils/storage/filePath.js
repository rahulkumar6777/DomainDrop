const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export const normalizeRelativePath = (value) => {
    if (typeof value !== "string") {
        throw new TypeError("File path must be a string");
    }

    const path = value.trim();
    const parts = path.split("/");
    const isInvalid =
        !path ||
        path.startsWith("/") ||
        path.endsWith("/") ||
        path.includes("\\") ||
        CONTROL_CHARACTERS.test(path) ||
        parts.some((part) => !part.trim() || part === "." || part === "..");

    if (isInvalid) {
        throw new TypeError("Invalid file path");
    }

    return path;
};

export const isValidRelativePath = (value) => {
    try {
        normalizeRelativePath(value);
        return true;
    } catch (_error) {
        return false;
    }
};

export const buildObjectKey = (spaceKeyPrefix, relativePath) => {
    const path = normalizeRelativePath(relativePath);
    const objectKey = `${spaceKeyPrefix}/${path}`;

    if (Buffer.byteLength(objectKey, "utf8") > 1024) {
        throw new TypeError("File path is too long");
    }

    return objectKey;
};

export const encodeObjectKey = (objectKey) =>
    objectKey.split("/").map(encodeURIComponent).join("/");
