const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel")
const bookModel=require("../models/bookModel")
const { isValid, isValidObjectId } = require("../validator/validator");
//const { getBookById } = require("../controllers/bookController");

//================================================Authentication============================================//

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key'] || req.headers['x-Api-key']
        if (!token) return res.status(401).send({ status: false, message: "token must be present" });

        let decodedtoken = jwt.verify(token, "pro@3")
       // if (!decodedtoken) return res.status(400).send({ status: false, message: "token is invalid" });

      
        req.decodedtoken = decodedtoken
        //req["x-api-key"] = decodedtoken
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};

//=============================================Authorization========================================//


const createAuthorize=async function(req,res,next){
    try{
        let userId=req.body.userId
        if(!isValid(userId)){
            return res.status(400).send({ status: false, message: "userId is required!" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "invalid userId" })
        }

        const userExist = await userModel.findOne({_id:userId,isDeleted:false})
        if (!userExist) {
            return res.status(404).send({
                status: false,
                message: "user not found! please check userId"
            })
        }
        let userOfToken=req.decodedtoken.userId

        if(userId!=userOfToken){
            return res.status(403).send({
            status: false,
            message: "User logged in is not allowed to modify the requested book data"})
         }
        next()
        }
    
        catch (err) {
            res.status(500).send({ status: false, message: err.message });
        }
    }

const authorization = async function (req, res, next) {
    try {
        
        let bookId = req.params.bookId || req.body.bookId || req.query.bookId

        //validating userId

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is required!" })
        }


        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "invalid bookId" })
        }

        const bookExist = await bookModel.findOne({_id:bookId,isDeleted:false})
        if (!bookExist) {
            return res.status(404).send({
                status: false,
                message: "book not found! please check bookId"
            })
        }

        let userId=bookExist.userId
        let userOfToken=req.decodedtoken.userId
        if (userOfToken!= userId) {
            return res.status(403).send({
                status: false,
                message: "User logged in is not allowed to modify the requested book data"
            });
        }
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }

};


module.exports= { authentication, authorization,createAuthorize }