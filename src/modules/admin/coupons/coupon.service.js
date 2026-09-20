import * as DBService from "../../../db/db.service.js";
export const getCouponStatus = (coupon)=>{
    const now = new Date();
    if(now < coupon.startDate) return "SCHEDULED";
    if(now > coupon.expirationDate) return "EXPIRED";
    if(coupon.usedCount >= coupon.usageLimit ) return "EXHAUSTED";
    return "ACTIVE";
};

const buildStatusWhere = (status)=>{
    const now = new Date();
    switch(status){
        case "SCHEDULED":
            return{startDate:{gt:now}};
        case"EXPIRED":
            return{startDate:{lte:now},expirationDate:{lt:now}};
        case"EXHAUSTED":
            return{startDate:{lte:now},expirationDate:{gte:now},usedCount:{gte:DBService.queryRaw("usageLimit")}};
        case "ACTIVE":
            return{startDate:{lte:now},expirationDate:{gte:now},usedCount:{lt:DBService.queryRaw("usageLimit")}};
        default:
            return {};
    }
}
