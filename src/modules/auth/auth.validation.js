import joi from "joi";
import { generalFields } from "../../utils/validation/generalField.js";

export const login = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const studentSignup = {
  body: joi
    .object()
    .keys({
      fullName: generalFields.fullName.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      confirmPassword:generalFields.confirmPassword.required(),
      phone: generalFields.phone.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};


export const confirmEmail = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
