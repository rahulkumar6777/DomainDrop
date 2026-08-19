import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const createSpace = async (req) => {

    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    try {
        const space = await Space.create({
            name: req.body.name,
            description: req.body.description ?? null,
            userId,
        });

        return {
            id: space._id,
            name: space.name,
            description: space.description,
            isDefault: space.isDefault,
            createdAt: space.createdAt,
            updatedAt: space.updatedAt,
        };
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError("Space with this name already exists", 409);
        }

        throw error;
    }
};
