const jwt=require("jsonwebtoken")
const user = require("../models/userModel")
const { isValid,
    isValidName,
    isValidRequest,
    isValidMail,
    isValidMobile,
    isValidUser,
    isValidTitle,
    checkPassword } = require("../validator/validator")

//<<------------------------------------------Create User--------------------------------------------------->>    
const registerUser = async function (req, res) {
    try {
        const data = req.body
        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "please enter a valid input" })
        }

        //extracting params
        let { title, name, phone, email, password, address } = data
        const newuser = {}

        //validation starts
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }

        

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: "Title must be among [Mr,Mrs,Miss]" })
        }

        newuser.title = title

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required" })
        }

        if (!isValidUser(name)) {
            return res.status(400).send({ status: false, message: "Please enter a valid name" })
        }

        newuser.name = name

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone is required" })
        }

        if (!isValidMobile(phone)) {
            return res.status(400).send({ status: false, message: "Please enter a valid indian phone number in string " })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!isValidMail(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" })
        }

        const ifAlreadyExist = await user.findOne({ $or: [{ email: email }, { phone: phone }] })
        

        if (ifAlreadyExist) {
            return res.status(400).send({ status: false, message: "Email or Phone number already in use" })
        }

        newuser.email = email
        newuser.phone = phone

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!checkPassword(password)) {
            return res.status(400).send({ status: false, message: "password length should be between 8-15 characters" })
        }

        newuser.password = password

        if(address){
        newuser.address = address}


        const newUser = await user.create(data)
        res.status(201).send({ status: true, message: "success", data: newUser })


    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//<<---------------------------------------------user login-------------------------------------------------->>

const login = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "please enter a valid input" })
        }

        let email = data.email
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!isValidMail(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" })
        }

        let password = data.password
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        if (!checkPassword(password)) {
            return res.status(400).send({ status: false, message: "password length should be between 8-15 characters" })
        }

        const loginUser = await user.findOne({ email: email, password: password })
        if (!loginUser) {
            return res.status(401).send({ status: false, message: "login Credentials are wrong" }) //login email and password does not match validation.
        }

        let token = jwt.sign(
            {
                userId: loginUser._id,
                iat:Math.floor(Date.now()/1000),
                }, "pro@3",{expiresIn: '10h'}
        )
        res.setHeader("x-api-key", token)
        res.status(201).send({ status: true, message: 'Success', data: token }) //creating jwt after successful login by author

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { registerUser, login }