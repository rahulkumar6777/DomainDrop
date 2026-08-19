import { returnError } from "../../../utils/errors/sendError.js";
import { getStorage } from "../services/getStorage.service.js";

export const getStorageController = async (req, res) => {
    try {
        const storage = await getStorage(req);
        return res.status(200).json({ success: true, storage });
    } catch (error) {
        returnError(res, error);
    }
};

