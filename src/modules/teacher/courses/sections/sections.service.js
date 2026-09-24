import dbService from "../../../../db/db.service.js";

const verifyCourseOwnership = async ({ courseId, teacherId }) => {
  const course = await dbService.findFirst({
    model: "teacherCourse",
    where: { id: courseId, teacherId },
    select: { id: true },
  });
  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return course;
};

export const createSection = async ({ courseId, teacherId, name, order }) => {
  await verifyCourseOwnership({ courseId, teacherId });

  let sectionOrder = order;
  if (sectionOrder === undefined) {
    const lastSection = await dbService.findFirst({
      model: "teacherCourseSection",
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    sectionOrder = lastSection ? lastSection.order + 1 : 1;
  }

  const orderExists = await dbService.findFirst({
    model: "teacherCourseSection",
    where: { courseId, order: sectionOrder },
    select: { id: true },
  });
  if (orderExists) {
    const error = new Error("SECTION_ORDER_ALREADY_EXISTS");
    error.cause = 409;
    throw error;
  }

  const section = await dbService.create({
    model: "teacherCourseSection",
    data: { courseId, name, order: sectionOrder },
  });

  return section;
};

export const getSections = async ({ courseId, teacherId }) => {
  await verifyCourseOwnership({ courseId, teacherId });

  const sections = await dbService.findMany({
    model: "teacherCourseSection",
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { items: true } },
      include:{
        items:{
          orderBy:{order:"asc"},
        }
      }
    },
  });

  return sections;
};

export const getSctionById = async({courseId,sectionId,teacherId})=>{
  await verifyCourseOwnership({courseId,teacherId});

  const section = await dbService.findFirst({
    model:"teacherCourseSection",
    where:{id:sectionId,courseId},
    include:{
      items:{
        orderBy:{order:"asc"},
      }
    }
  })
  if(!section){
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return section;
}

export const updateSection = async ({
  courseId,
  sectionId,
  teacherId,
  name,
  order,
}) => {
  await verifyCourseOwnership({ courseId, teacherId });

  const section = await dbService.findFirst({
    model: "teacherCourseSection",
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  if (order !== undefined) {
    const orderExists = await dbService.findFirst({
      model: "teacherCourseSection",
      where: {
        courseId,
        order,
        NOT: { id: sectionId },
      },
      select: { id: true },
    });
    if (orderExists) {
      const error = new Error("SECTION_ORDER_ALREADY_EXISTS");
      error.cause = 409;
      throw error;
    }
  }

  const updatedSection = await dbService.updateOne({
    model: "teacherCourseSection",
    where: { id: sectionId },
    data: {
      ...(name !== undefined && { name }),
      ...(order !== undefined && { order }),
    },
  });

  return updatedSection;
};


export const deleteSection = async ({ courseId, sectionId, teacherId }) => {
  await verifyCourseOwnership({ courseId, teacherId });

  const section = await dbService.findFirst({
    model: "teacherCourseSection",
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.deleteOne({
    model: "teacherCourseSection",
    where: { id: sectionId },
  });

  return section;
};

export const reorderSections = async ({ courseId, teacherId, sections }) => {
  await verifyCourseOwnership({ courseId, teacherId });

  const sectionIds = sections.map((s)=>s.id);
  const count = await dbService.count({
    model:"teacherCourseSection",
    where:{
      id:{
        in:sectionIds
      },
      courseId
    }
  })
  if(count !== sections.length){
    const error = new Error("INVALID_SECTION_IDS");
    error.cause = 400;
    throw error;
  }
  
  await dbService.transaction(
    sections.map(({id,order})=>(
      dbService.updateOne({
        model:"teacherCourseSection",
        where:{id,courseId},
        data:{order}
      })
    ))
  )
  return { message: "SECTIONS_REORDERED" };
};
