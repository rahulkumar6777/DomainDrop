import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const updateSpace = async (req) => {

    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const updates = {};
    if (req.body.name !== undefined) {
        updates.name = req.body.name;
    }
    if (req.body.description !== undefined) {
        updates.description = req.body.description;
    }

    try {
        const space = await Space.findOneAndUpdate(
            { _id: req.params.spaceId, userId, isDefault: false },
            { $set: updates },
            { new: true, runValidators: true },
        )
            .select("_id name description isDefault createdAt updatedAt")
            .lean();

        if (!space) {
            const existingSpace = await Space.findOne({ _id: req.params.spaceId, userId })
                .select("isDefault")
                .lean();

            if (existingSpace?.isDefault) {
                throw new AppError("Default space cannot be updated", 403);
            }

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
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError("Space with this name already exists", 409);
        }

        throw error;
    }
};
