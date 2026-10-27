import * as db from "../../../db/db.service.js";
import { throwError } from "../../../utils/response.js";

export const getAllCertificatesService = async (query) => {
  const { page = 1, limit = 10, search = "", locale = "en", isActive } = query;
 
};

export const getCertificatesByIdService = async (id, locale) => {
  
};

export const deleteCertificatesService = async (id) => {
 
};
