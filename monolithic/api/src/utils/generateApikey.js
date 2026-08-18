import crypto from 'crypto';

export const generateApiKey = () => {
    return `dh-${crypto.randomBytes(16).toString('hex')}`;
}