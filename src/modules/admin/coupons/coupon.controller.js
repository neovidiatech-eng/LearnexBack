import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as couponService from "./coupon.service.js"

export const createCoupon = asyncHandler(async(req,res)=>{
    const result = await couponService.createCoupon({body:req.body});
    return successResponse({
        res,
        status:201,
        data:result,
        message:"COUPON_CREATED"
    })
})

export const getCoupons = asyncHandler(async(req,res)=>{
    const { search, status, page, limit } = req.query;
    const result = await couponService.getCouponsService({search,status,page,limit})
    return successResponse({
        res,
        data:result,
        status:200,
        message:"COUPONS_FETCHED"
    })
})
export const getCouponById = asyncHandler(async(req,res)=>{
    const{id} = req.params;
    const coupon = await couponService.getCouponByIdService(id);
    return successResponse({
        res,
        status:200,
        data:coupon,
        
    })
})

export const updateCoupon = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const coupon = await couponService.updateCoupon({id,body:req.body});
    return successResponse({
        res,
        status:200,
        data:coupon,
        message:"COUPON_UPDATED"
    })
})

export const deleteCoupon = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    await couponService.deleteCouponService({id});

    return successResponse({
        res,
        status:200,
        data:null,
        message:"COUPON_DELETED"
    
    })
})

export const toggleCouponStatusController = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const coupon = await couponService.toggleCouponStatus({ id });

    return successResponse({
      res,
      status: 200,
      data: coupon,
      message: "COUPON_STATUS_TOGGLED",
    });
  }
);