import * as bcrypt from 'bcrypt';

export const hashPassword = async (plainText: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(plainText, salt);
};

export const matchPassword = async (
  raw: string,
  encrypted: string,
): Promise<boolean> => {
  return await bcrypt.compare(raw, encrypted);
};
