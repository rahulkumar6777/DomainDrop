import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const getSpace = async (req) => {

    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const space = await Space.findOne({ _id: req.params.spaceId, userId })
        .select("_id name description isDefault createdAt updatedAt")
        .lean();

    if (!space) {
        throw new AppError("Space not found", 404);
    }

    return {
        id: space._id,
        name: space.name,
        description: space.description,
        isDefault: space.isDefault,
        createdAt: space.createdAt,
        updatedAt: space.updatedAt,
    };
};
