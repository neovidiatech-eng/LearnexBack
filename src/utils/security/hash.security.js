import bcrypt from "bcryptjs";

export const generateHash = async ({
  plainText = "",
  saltRound = process.env.SALT || 12,
} = {}) => {
  return bcrypt.hashSync(plainText, parseInt(saltRound));
};

export const compareHash = async ({
  plainText = "",
  hashValue = "",
} = {}) => {
  console.log(typeof plainText, typeof hashValue);
  if (!plainText || !hashValue) return false;
  return bcrypt.compareSync(plainText, hashValue);
};
