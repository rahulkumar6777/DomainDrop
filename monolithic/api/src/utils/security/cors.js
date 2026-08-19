import { envs } from "../../lib/env.js";

export const corsOption = {
    origin: envs.FRONTEND_URI,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization' ,'x-api-key']
}
