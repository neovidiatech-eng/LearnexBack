import { Router } from "express";
import { authentication } from "../../../../middleware/authentication.middleware.js";
import { validation } from "../../../../middleware/validation.middleware.js";
import * as sectionsValidation from "./sections.validation.js";
import * as sectionsController from "./sections.controller.js"

const router = Router();

router.post("/:courseId",
    authentication(),
    validation(sectionsValidation.createSectionSchema),
    sectionsController.createSection
)
router.patch(
  "/:courseId/reorder",   
  authentication(),
  validation(sectionsValidation.reorderSectionsSchema),
  sectionsController.reorderSections
);

router.get(
    "/:courseId",
    authentication(),
    sectionsController.getSections
)

router.get(
    "/:courseId/:sectionId",
    authentication(),
    validation(sectionsValidation.getSectionByIdSchema),
    sectionsController.getSectionById
)

router.patch("/:courseId/:sectionId",
    authentication(),
    validation(sectionsValidation.updateSectionSchema),
    sectionsController.updateSection
)
router.delete("/:courseId/:sectionId",
    authentication(),
    validation(sectionsValidation.deleteSectionSchema),
    sectionsController.deleteSection
)

export default router;