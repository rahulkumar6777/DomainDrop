import jwt from 'jsonwebtoken';
import { envs } from '../lib/env.js';


export const verifyJwt = async (req, res, next) => {

    const accessToken = req.cookies?.AccessToken || req.headers.authorization?.replace('Bearer ', "");

    if (!accessToken) {
        return res.status(401).json({
            message: "UnAuthorize Request"
        })
    }

    const decoded = jwt.verify(accessToken, envs.ACCESS_TOKEN_SECRET, (error, decode) => {
        if (error) {
            return res.status(401).json({
                message: "Invalid Token"
            })
        }

        res.user = decoded;
        next()
    })

};