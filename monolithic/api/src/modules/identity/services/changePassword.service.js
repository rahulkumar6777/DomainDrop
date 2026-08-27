import { AppError } from "../../../utils/errors/AppError.js";
import { User } from "../models/user.Model.js";


export const changePasswordService = async (req) => {

    const { oldPassword, newPassword } = req.body;

    if (req?.auth.type !== "jwt") {
        throw new AppError("Use Token for reset password", 400)
    }

    const user = await User.findById(req?.user._id);
    if (!user) {
        throw new AppError("Invalid User", 404)
    }


    const verifyPassword = await user.checkpassword(oldPassword);
    if (!verifyPassword) {
        throw new AppError('Invalid Old password', 401);
    }

    await User.findByIdAndUpdate(
        {
            _id: user._id
        },
        {
            $set: { password: newPassword }
        })

        
}