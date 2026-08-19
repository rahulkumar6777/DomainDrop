import express from "express";
import { authReq } from "../../../../middlewares/authReq.middleware.js";
import { requireScope } from "../../../../middlewares/authorizeRequest.middleware.js";
import { createSpaceController } from "../../controllers/createSpace.controller.js";
import { deleteSpaceController } from "../../controllers/deleteSpace.controller.js";
import { getSpaceController } from "../../controllers/getSpace.controller.js";
import { getSpacesController } from "../../controllers/getSpaces.controller.js";
import { updateSpaceController } from "../../controllers/updateSpace.controller.js";
import {
    createSpaceValidator,
    spaceIdValidator,
    updateSpaceValidator,
} from "../../validators/space.validator.js";

const router = express.Router();

router.post("/", authReq, requireScope("spaces:write"), createSpaceValidator, createSpaceController);
router.get("/", authReq, requireScope("spaces:read"), getSpacesController);
router.get("/:spaceId", authReq, requireScope("spaces:read"), spaceIdValidator, getSpaceController);
router.patch("/:spaceId", authReq, requireScope("spaces:write"), updateSpaceValidator, updateSpaceController);
router.delete("/:spaceId", authReq, requireScope("spaces:write"), spaceIdValidator, deleteSpaceController);

export default router;
