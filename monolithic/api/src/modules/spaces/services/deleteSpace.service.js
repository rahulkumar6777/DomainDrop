import { File } from "../../../models/file.model.js";
import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const deleteSpace = async (req) => {

    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const space = await Space.findOne({ _id: req.params.spaceId, userId })
        .select("_id isDefault")
        .lean();

    if (!space) {
        throw new AppError("Space not found", 404);
    }

    if (space.isDefault) {
        throw new AppError("Default space cannot be deleted", 403);
    }

    const file = await File.exists({ ownerId: userId, spaceId: space._id });
    if (file) {
        throw new AppError("Space is not empty", 409);
    }

    await Space.deleteOne({ _id: space._id, userId });

    return space._id;
};
