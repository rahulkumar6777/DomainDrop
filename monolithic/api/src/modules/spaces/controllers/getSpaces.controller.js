import { returnError } from "../../../utils/errors/sendError.js";
import { getSpaces } from "../services/getSpaces.service.js";

export const getSpacesController = async (req, res) => {
    try {
        const spaces = await getSpaces(req);
        return res.status(200).json({ success: true, spaces });
    } catch (error) {
        returnError(res, error);
    }
};
