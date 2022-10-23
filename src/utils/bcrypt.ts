import bcrypt from "bcrypt";

export const hashedPassword = async (payload: string, salt: number) => {
    return await bcrypt.hash(payload, salt);
}