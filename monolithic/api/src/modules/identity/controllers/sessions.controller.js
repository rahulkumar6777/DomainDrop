import { validationResult } from "express-validator";
import { listSessionsService, revokeOtherSessionsService, revokeSessionService, } from "../services/session.service.js";
import { returnError } from "./../../../utils/errors/sendError.js";
import { getClearRefreshTokenOptions } from "../../../utils/security/cookieOption.js";

export const listSessionsController = async (req, res) => {
    try {
        const sessions = await listSessionsService(req);

        return res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        returnError(res, error);
    }
};

export const revokeSessionController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
            });
        }

        const session = await revokeSessionService(req);
        if (session.isCurrent) {
            res.clearCookie("RefreshToken", getClearRefreshTokenOptions());
        }

        return res.status(200).json({
            success: true,
            message: "Session revoked",
            sessionId: session.sessionId,
            currentSession: session.isCurrent,
        });
    } catch (error) {
        returnError(res, error);
    }
};

export const revokeOtherSessionsController = async (req, res) => {
    try {
        const revokedSessions = await revokeOtherSessionsService(req);

        return res.status(200).json({
            success: true,
            message: "Other sessions revoked",
            revokedSessions,
        });
    } catch (error) {
        returnError(res, error);
    }
};
