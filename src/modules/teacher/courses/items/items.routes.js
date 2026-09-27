import { Router } from "express";
import { authentication } from "../../../../middleware/authentication.middleware.js";
import { validation } from "../../../../middleware/validation.middleware.js";
import * as itemsValidation from "./items.validation.js";
import * as itemsController from "./items.controller.js";
import { localFileUpload } from "../../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../../utils/multer/fileValidation.js";

const router = Router();

router.post("/:sectionId/items",
    authentication(),
    localFileUpload({
        customPath: (req) => `teacherCourse/items/${req.params.sectionId}`,
    }).single("materialLink"),
    validation(itemsValidation.createItemSchema),
    itemsController.createItem
)

router.get("/:sectionId/items", 
    authentication(),
    validation(itemsValidation.getItemsSchema),
    itemsController.getItems
)


router.get("/:sectionId/items/:itemId",
    authentication(),
    validation(itemsValidation.getItemByIdSchema),
    itemsController.getItemById
)

router.patch("/:sectionId/items/:itemId",
    authentication(),
    localFileUpload({
        customPath:(req)=>`teacherCourse/items/${req.params.sectionId}`
    }).single("materialLink"),
    validation(itemsValidation.updateItemSchema),
    itemsController.updateItem
)

router.delete("/:sectionId/items/:itemId",
    authentication(),
    validation(itemsValidation.getItemByIdSchema),
    itemsController.deletedItem
)



export default router;
