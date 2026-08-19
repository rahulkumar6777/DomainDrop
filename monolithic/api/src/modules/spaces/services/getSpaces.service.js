import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const getSpaces = async (req) => {

    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const spaces = await Space.find({ userId })
        .select("_id name description isDefault createdAt updatedAt")
        .sort({ isDefault: -1, name: 1 })
        .lean();

    return spaces.map((space) => ({
        id: space._id,
        name: space.name,
        description: space.description,
        isDefault: space.isDefault,
        createdAt: space.createdAt,
        updatedAt: space.updatedAt,
    }));
};
