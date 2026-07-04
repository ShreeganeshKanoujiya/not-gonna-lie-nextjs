import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVarificationEmail";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await req.json()
        const exstingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        })

        if (exstingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists.",
            },
                { status: 400 }
            )
        }

        const exstingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (exstingUserByEmail) {
            if (exstingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User with this email already exists.",
                },
                    { status: 400 }
                )
            } else {
                const hasedPassword = await bcrypt.hash(password, 10);
                exstingUserByEmail.password = hasedPassword;
                exstingUserByEmail.verifyCode = verifyCode;
                exstingUserByEmail.verifyCodeExpires = new Date(Date.now() + 3600000);
                await exstingUserByEmail.save();
            }
        } else {
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpires: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: []
            })

            await newUser.save()
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            },
                { status: 500 }
            )
        }

        return Response.json({
            success: true,
            message: "User created successfully. Please check your email for verification.",
        },
            { status: 201 }
        )

    } catch (error) {
        console.error("Error occurred while signing up:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while signing up.",
            },
            { status: 500 }
        )
    }
}