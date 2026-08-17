import nodemailer from 'nodemailer';
import { envs } from '../../lib/env.js';

export const transporter = nodemailer.createTransport({
    host: `${envs.EMAIL_HOST}`,
    port: `${envs.EMAIL_PORT}`,
    secure: true,
    auth: {
        user: `${envs.EMAIL_USER}`,
        pass: `${envs.EMAIL_PASS}`
    }
});