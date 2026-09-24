import dbService from "../../../../db/db.service";
import { asyncHandler, successResponse } from "../../../../utils/response"
import * as teacherCourseService from "./courses.service.js"
export const createTeacherCourse = asyncHandler(async(req,res,next)=>{
    const {name,description,price,totalHours} = req.body;
    const teacher = await dbService.findFirst({
        model:"teacher",
        where:{
            userId:req.user.id
        },
        select:{
            id:true
        }
    })
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND")
        error.cause = 404
        throw error
    }
    const course = await teacherCourseService.createTeacherCourse({
        teacherId:teacher.id,
        name,
        description,
        price,
        totalHours,
        wallPaper:req.file
    });
    return successResponse({
        res,
        status:201,
        data:course,
        message:"COURSE_CREATED_SUCCESS"
    });


});

export const getCourses = asyncHandler(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  let teacherId;

  if (req.user.role === "TEACHER") {
    const teacher = await dbService.findFirst({
      model: "teacher",
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!teacher) {
      const error = new Error("TEACHER_NOT_FOUND");
      error.cause = 404;
      throw error;
    }

    teacherId = teacher.id;
  }

  const courses = await teacherCourseService.getCourses({
    teacherId,
    role: req.user.role,
    search,
    page,
    limit,
  });

  return successResponse({
    res,
    statusCode: 200,
    data: courses,
  });
});

export const getCourseById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await teacherCourseService.getCourseById({
    courseId: id,
  });

  return successResponse({
    res,
    statusCode: 200,
    data: course,
  });
});

export const updateTeacherCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    totalHours,
  } = req.body;

  const teacher = await dbService.findFirst({
    model: "teacher",
    where: {
      userId: req.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!teacher) {
    const error = new Error("TEACHER_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  const course = await teacherCourseService.updateTeacherCourse({
    courseId: id,
    teacherId: teacher.id,
    name,
    description,
    price,
    totalHours,
    wallPaper:req.file?.relativeDestination
  });

  return successResponse({
    res,
    statusCode: 200,
    data: course,
    message: "COURSE_UPDATED_SUCCESS",
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const teacher = await dbService.findFirst({
        model: "teacher",
        where: {
            userId: req.user.id,
        },
        select: {
            id: true,
        },
    });
    if(!teacher){
        const error = new Error("TEACHER_NOT_FOUND")
        error.cause = 404
        throw error
    }
    const course = await teacherCourseService.deleteCourse({
        courseId:id,
        teacherId:teacher.id
    });
    return successResponse({
        res,
        status:200,
        message:"COURSE_DELETED_SUCCESS"
    });
  
});