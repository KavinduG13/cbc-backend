import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {

    const hashedPassword = bcrypt.hashSync(req.body.password, 10) // Meke 10 kiyanne salting rounds kiyana eka
    // E kiyanne password eka 10 wathawak hash karana eka

    const user = new User(
        {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword
        }
    )

    user.save().then(
        () => {
            res.json(
                {
                    message: "User created successfully"
                }
            )
        }
    ).catch(
        () => {
            res.json(
                {
                    message: "Failed to create user"
                }
            )
        }
    )
}

export function loginUser(req, res) {

    User.findOne(
        {
            email: req.body.email
        }
    ).then(
        (user) => {
            if (user == null) {
                res.status(404).json(
                    {
                        message: "User not found"
                    }
                )
            } else {
                const isPasswordMatching = bcrypt.compareSync(req.body.password, user.password)
                if (isPasswordMatching) {

                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            isEmailVerified: user.isEmailVerified,
                        },
                        process.env.JWT_SECRET
                    )

                    res.json(
                        {
                            message: "Login successful",
                            token: token,
                            user: {
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                role: user.role,
                                isEmailVerified: user.isEmailVerified
                            }
                        }
                    )
                } else {
                    res.status(401).json(
                        {
                            message: "Invalid password"
                        }
                    )
                }
            }
        }
    )

}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }

    if (req.user.role != "admin") {
        return false
    }

    return true
}

export function isCustomer(req) {
    if (req.user == null) {
        return false
    }

    if (req.user != "user") {
        return false
    }

    return true
}