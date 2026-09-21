import * as DBService from "../../../db/db.service.js";
export const getCouponStatus = (coupon)=>{
    const now = new Date();
    if (!coupon.isActive) return "DEACTIVATED";
    if(now < coupon.startDate) return "SCHEDULED";
    if(now > coupon.expirationDate) return "EXPIRED";
    if(coupon.usedCount >= coupon.usageLimit ) return "EXHAUSTED";
    
    return "ACTIVE";
};

const buildStatusWhere = (status)=>{
    const now = new Date();
    switch(status){
        case "SCHEDULED":
            return{isActive:true,startDate:{gt:now}};
        case"EXPIRED":
            return{isActive:true,startDate:{lte:now},expirationDate:{lt:now}};
        case"EXHAUSTED":
            return{isActive:true,startDate:{lte:now},expirationDate:{gte:now},usedCount:{gte:DBService.queryRaw("usageLimit")}};
        case "ACTIVE":
            return{isActive:true,startDate:{lte:now},expirationDate:{gte:now},usedCount:{lt:DBService.queryRaw("usageLimit")}};
        case "DEACTIVATED":
            return{isActive:false};
        default:
            return {};
    }
}

export const createCoupon = async ({body})=>{
    const existing = await DBService.findFirst({
        model:"coupon",
        where:{
            code:body.code,
        }
    })
    if(existing){
        const error = new Error("COUPON_ALREADY_EXISTS");
        error.cause = 409;
        throw error;
    }
    return DBService.create({
        model:"coupon",
        data:{
            ...body,
            startDate:new Date(body.startDate),
            expirationDate:new Date(body.expirationDate),
        }
    })
    
}

export const getCouponsService = async({search,status,page=1,limit=10})=>{
    const where ={
        ...(search && {
            OR:[
                {name:{contains:search,mode:"insensitive"}},
                {code:{contains:search,mode:"insensitive"}}
            ]
        }),
        ...(status && status !== "all" && buildStatusWhere(status.toUpperCase()))
    }
    const [coupons ,total] = await Promise.all([
        DBService.findMany({
            model:"coupon",
            where,
            orderBy:{createdAt:"desc"},
            skip:(Number(page) - 1)*Number(limit),
            take:Number(limit),
        }),
        DBService.count({model:"coupon",where})
    ]);
    const withStatus = coupons.map((c) => ({
        ...c,
        status:getCouponStatus(c)
    }));
    return {coupons:withStatus,total,page,limit}
};

export const getCouponByIdService = async (id) => {
  const coupon = await DBService.findFirst({ model: "coupon", where: { id } });
  if (!coupon) {
    const error = new Error("COUPON_NOT_FOUND");
    error.cause = 404;
    throw error;
  }
  return { ...coupon, status: getCouponStatus(coupon) };
};

export const updateCoupon = async({id,body})=>{
    const coupon = await DBService.findFirst({
        model:"coupon",
        where:{id}
    });
    if(!coupon){
        const error = new Error("COUPON_NOT_FOUND");
        error.cause = 404;
        throw error;
    }
    if(body.code && body.code !== coupon.code){
        const existing = await DBService.findFirst({
            model:"coupon",
            where:{
                code:body.code,
                NOT:{id}
            }
        })
        if(existing){
            const error = new Error("COUPON_CODE_ALREADY_EXISTS");
            error.cause = 409;
            throw error;
        }
    }
    const startDate = body.startDate ? new Date(body.startDate) : coupon.startDate;
    const expirationDate = body.expirationDate ? new Date(body.expirationDate) : coupon.expirationDate;
    if(expirationDate <= startDate){
        const error = new Error("INVALID_DATE_RANGE");
        error.cause = 400;
        throw error;
    }
    if(
        body.usageLimit !== undefined &&
        body.usageLimit < coupon.usedCount
    ){
        const error = new Error("USAGE_LIMIT_LESS_THAN_USED_COUNT");
        error.cause = 400;
        throw error;
    }
    return DBService.updateOne({
        model:"coupon",
        where:{id},
        data:{
            ...body,
            startDate,
            expirationDate
        }
    })
}

export const deleteCouponService = async ({id}) => {
  const coupon = await DBService.findFirst({
    model: "coupon",
    where: { id },
  });

  if (!coupon) {
    const error = new Error("COUPON_NOT_FOUND");
    error.cause = 404;
    throw error;
  }

  return DBService.deleteOne({
    model: "coupon",
    where: { id },
  });
};

export const toggleCouponStatus = async ({id}) => {
  const coupon = await DBService.findFirst({
    model: "coupon",
    where: { id },
  });

  if (!coupon) {
    const error = new Error("COUPON_NOT_FOUND");
    error.cause = 404;
    throw error;
  }


  return DBService.updateOne({
    model: "coupon",
    where: { id },
    data: {
      isActive: !coupon.isActive,
    },
  });
};