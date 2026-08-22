import express from "express";
import { authReq } from "../../../../middlewares/authReq.middleware.js";
import { requireScope } from "../../../../middlewares/authorizeRequest.middleware.js";
import { getStorageController } from "../../controllers/getStorage.controller.js";
import { updateStoragePolicyController } from "../../controllers/updateStoragePolicy.controller.js";
import { updateStorageCorsController } from "../../controllers/updateStorageCors.controller.js";
import { updateStorageCorsValidator, updateStoragePolicyValidator, } from "../../validators/storage.validator.js";

const router = express.Router();


router.get("/", authReq, requireScope("storage:read"), getStorageController);
router.patch("/policy", authReq, requireScope("policy:write"), updateStoragePolicyValidator, updateStoragePolicyController);
router.put("/cors", authReq, requireScope("cors:write"), updateStorageCorsValidator, updateStorageCorsController);

export default router;
