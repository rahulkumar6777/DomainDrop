import express from "express";
import { authReq } from "../../../../middlewares/authReq.middleware.js";
import { requireScope } from "../../../../middlewares/authorizeRequest.middleware.js";
import { completeUploadController } from "../../controllers/completeUpload.controller.js";
import { createPartUrlsController } from "../../controllers/createPartUrls.controller.js";
import { createSignedUrlController } from "../../controllers/createSignedUrl.controller.js";
import { createUploadUrlController } from "../../controllers/createUploadUrl.controller.js";
import { deleteFileController } from "../../controllers/deleteFile.controller.js";
import { getFileController } from "../../controllers/getFile.controller.js";
import { getFilesController } from "../../controllers/getFiles.controller.js";
import {
    completeUploadValidator,
    createUploadUrlValidator,
    fileIdValidator,
    getFilesValidator,
    multipartPartUrlsValidator,
    signedUrlValidator,
} from "../../validators/file.validator.js";

const router = express.Router();

router.post("/upload-url", authReq, requireScope("files:write"), createUploadUrlValidator, createUploadUrlController);
router.get("/", authReq, requireScope("files:read"), getFilesValidator, getFilesController);
router.get("/:fileId", authReq, requireScope("files:read"), fileIdValidator, getFileController);
router.post("/:fileId/parts", authReq, requireScope("files:write"), multipartPartUrlsValidator, createPartUrlsController);
router.post("/:fileId/complete", authReq, requireScope("files:write"), completeUploadValidator, completeUploadController);
router.post("/:fileId/signed-url", authReq, requireScope("files:read"), signedUrlValidator, createSignedUrlController);
router.delete("/:fileId", authReq, requireScope("files:write"), fileIdValidator, deleteFileController);

export default router;
