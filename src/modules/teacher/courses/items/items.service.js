import dbService from "../../../../db/db.service.js";

const verifySectionOwnership = async ({ sectionId, teacherId }) => {
  const section = await dbService.findFirst({
    model: "teacherCourseSection",
    where: {
      id: sectionId,
      course: {
        teacherId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!section) {
    const error = new Error("SECTION_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return section;
};

export const createItem = async({
    sectionId,
    teacherId,
    title,
    description,
    materialType,
    materialLink,
    order
    })=>{
    await verifySectionOwnership({sectionId,teacherId});
    let itemOrder = order;
    if(itemOrder == undefined){
        const lastItem = await dbService.findFirst({
            model:"teacherCourseSectionItem",
            where:{
                sectionId,
            },
            orderBy:{
                order:"desc"
            },
            select:{
                order:true
            }
        })
        itemOrder = lastItem ? lastItem.order + 1 : 1;
    }

    const orderExists = await dbService.findFirst({
        model:"teacherCourseSectionItem",
        where:{
            sectionId,
            order:itemOrder
        },
        select:{
            id:true
        }
    });

    if(orderExists){
        const error = new Error("ITEM_ORDER_ALREADY_EXISTS");
        error.cause = 400;
        throw error;
    }
    return await dbService.create({
        model:"teacherCourseSectionItem",
        data:{
            sectionId,
            title,
            description,
            materialType,
            materialLink,
            order:itemOrder
        }
    })

}

export const getItems = async({sectionId,teacherId})=>{
  await verifySectionOwnership({sectionId,teacherId});

  return await dbService.findMany({
    model:"teacherCourseSectionItem",
    where:{
      sectionId,
    },
    orderBy:{
      order:"asc"
    }
  })

}

export const getItemById = async({sectionId,itemId,teacherId})=>{
  await verifySectionOwnership({sectionId,teacherId});

  const item = await dbService.findFirst({
    model:"teacherCourseSectionItem",
    where:{
        id:itemId,
        sectionId
    }

  });
  if(!item){
    const error = new Error("ITEM_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return item;
  
}

export const updateItem = async({
  sectionId,
  itemId,
  teacherId,
  title,
  description,
  materialType,
  materialLink,
  order,

})=>{
  await verifySectionOwnership({sectionId,teacherId});

  const item = await dbService.findFirst({
    model:"teacherCourseSectionItem",
    where:{
      id:itemId,
      sectionId
    }
  });
  if(!item){
    const error = new Error("ITEM_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  
  if(order !== undefined && order !== item.order){
    const orderExists = await dbService.findFirst({
      model:"teacherCourseSectionItem",
      where:{
        sectionId,
        order,
        id:{ not: itemId }
      },
      select:{
        id:true
      }
    });
    if(orderExists){
      const error = new Error("ITEM_ORDER_ALREADY_EXISTS");
      error.cause = 400;
      throw error;
    }
  }

  const updatedItem = await dbService.updateOne({
    model:"teacherCourseSectionItem",
    where:{
      id:itemId,
    },
    ...(title !== undefined && {title}),
    ...(description !== undefined && {description}),
    ...(materialType !== undefined && {materialType}),
    ...(materialLink !== undefined && {materialLink}),
    ...(order !== undefined && {order}),
  });
  return {updatedItem, oldMaterialLink:item.materialLink}
  
  

}

export const deleteItem = async ({ sectionId, itemId, teacherId }) => {
  await verifySectionOwnership({ sectionId, teacherId });

  const item = await dbService.findFirst({
    model: "teacherCourseSectionItem",
    where: {
      id: itemId,
      sectionId,
    },
  });

  if (!item) {
    const error = new Error("ITEM_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  await dbService.delete({
    model: "teacherCourseSectionItem",
    where: {
      id: itemId,
    },
  });

  return item;
};

