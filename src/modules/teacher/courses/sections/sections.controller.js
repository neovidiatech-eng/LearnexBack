import { asyncHandler, successResponse } from "../../../../utils/response.js";
import dbService from "../../../../db/db.service.js";
import * as sectionService from "./sections.service.js";

const getTeacherId = async (userId) => {
  const teacher = await dbService.findFirst({
    model: "teacher",
    where: { userId },
    select: { id: true },
  });
  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return teacher.id;
};

export const createSection = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { name, order } = req.body;

  const teacherId = await getTeacherId(req.user.id);

  const section = await sectionService.createSection({
    courseId,
    teacherId,
    name,
    order,
  });

  return successResponse({
    res,
    status: 201,
    data: section,
    message: "SECTION_CREATED_SUCCESS",
  });
});

export const getSections = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const teacherId = await getTeacherId(req.user.id);

  const sections = await sectionService.getSections({ courseId, teacherId });

  return successResponse({
    res,
    status: 200,
    data: sections,
  });
});

export const getSectionById = asyncHandler(async(req,res,next)=>{
  const {courseId,sectionId} = req.params;
  const teacherId = await getTeacherId(req.user.id)
  const section = await sectionService.getSctionById({courseId,sectionId,teacherId})
  return successResponse({
    res,
    status: 200,
    data: section,
  });
})

export const updateSection = asyncHandler(async (req, res, next) => {
  const { courseId, sectionId } = req.params;
  const { name, order } = req.body;

  const teacherId = await getTeacherId(req.user.id);

  const section = await sectionService.updateSection({
    courseId,
    sectionId,
    teacherId,
    name,
    order,
  });

  return successResponse({
    res,
    status: 200,
    data: section,
    message: "SECTION_UPDATED_SUCCESS",
  });
});

export const deleteSection = asyncHandler(async (req, res, next) => {
  const { courseId, sectionId } = req.params;

  const teacherId = await getTeacherId(req.user.id);

  await sectionService.deleteSection({ courseId, sectionId, teacherId });

  return successResponse({
    res,
    statusCode: 200,
    message: "SECTION_DELETED_SUCCESS",
  });
});


export const reorderSections = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { sections } = req.body; // [{ id, order }, ...]

  const teacherId = await getTeacherId(req.user.id);

  await sectionService.reorderSections({ courseId, teacherId, sections });

  return successResponse({
    res,
    statusCode: 200,
    message: "SECTIONS_REORDERED_SUCCESS",
  });
});
