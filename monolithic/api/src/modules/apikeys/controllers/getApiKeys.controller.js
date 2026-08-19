import { returnError } from "../../../utils/errors/sendError.js";
import { getApiKeys } from "../services/getApiKeys.service.js";

export const getApiKeysController = async (req, res) => {
    try {

        const keys = await getApiKeys(req);

        return res.status(200).json({
            success: true,
            keys
        })

    } catch (error) {
        returnError(res, error)
    }
}
