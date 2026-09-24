import dbService from "../../../../db/db.service"
import { teacherCourseStatusEnum } from "../../../../utils/Enums/teacherCourse.enum"
import fs from "fs/promises"
import path from "path"


export const createTeacherCourse = async({
    teacherId,
    name,
    description,
    price,
    totalHours,
    wallPaper
})=>{
    const course = await dbService.create({
        model:"teacherCourse",
        data:{
            teacherId,
            name,
            description,
            price,
            totalHours,
            wallPaper
        }
    })
    return course
    
}


export const getCourses = async ({
  teacherId,
  role,
  search,
  page,
  limit,
}) => {
  const where =
    role === "TEACHER"
      ? {
          teacherId,
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        }
      : {
          status: teacherCourseStatusEnum.APPROVED,
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        };

  return await dbService.findManyWithPaginationAndCount({
    model: "teacherCourse",
    where,
    page,
    limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      wallPaper: true,
      name: true,
      description: true,
      price: true,
      totalHours: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getCourseById = async ({ courseId }) => {
  const course = await dbService.findFirst({
    model: "teacherCourse",
    where: {
      id: courseId,
    },
    include: {
      sections: {
        orderBy: {
          order: "asc",
        },
        include: {
          items: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return course;
};

export const updateTeacherCourse = async({
    courseId,
    teacherId,
    name,
    description,
    price,
    totalHours,
    wallPaper

})=>{
    const course = await dbService.findFirst({
        model:"teacherCourse",
        where:{
            id:courseId,
            teacherId
        },
        select:{
            id:true,
            wallPaper:true
        }
    })
    if(!course){
        const error = new Error("TEACHER_COURSE_NOT_FOUND")
        error.cause = 404
        throw error
    }
    
    const updateCourse= await dbService.updateOne({
        model:"teacherCourse",
        where:{
            id:courseId,
        },
        data:{
            ...(name !== undefined && {name}),
            ...(description !== undefined && {description}),
            ...(price !== undefined && {price}),
            ...(totalHours !== undefined && {totalHours}),
            ...(wallPaper !== undefined && {wallPaper}),
        }
    });
    if(wallPaper !== undefined && course.wallPaper && course.wallPaper !== wallPaper){
        const filePath = path.resolve(course.wallPaper);
        try{
            await fs.unlink(filePath)
        }catch(error){
            if(error.code !== "ENOENT"){
                console.log("error in deleting file: ", error)
            }
        }
    }
    return updateCourse



}

export const deleteCourse = async({
    courseId,
    teacherId
})=>{
    const course = await dbService.findFirst({
        model:"teacherCourse",
        where:{
            id:courseId,
            teacherId
        },
        select:{
            id:true,
            wallPaper:true
        }
    })
    if(!course){
        const error = new Error("COURSE_NOT_FOUND")
        error.cause = 404
        throw error
    }
    await dbService.deleteOne({
        model:"teacherCourse",
        where:{
            id:courseId
        }
    })
    if(course.wallPaper){
        const filePath = path.resolve(course.wallPaper);
        try{
            await fs.unlink(filePath)
        }catch(error){
            if(error.code !== "ENOENT"){
                console.log("error in deleting file: ", error)
            }
        }
    }
    return course

}

