const reviewModel = require('../models/reviewModel')
const bookModel=require('../models/bookModel')
const { isValid,
    isValidName,
    isValidRequest,
    isValidMail,
    isValidMobile,
    isValidUser,
    isValidTitle,
    checkPassword,
isValidRating, 
extraspace,
isValidObjectId} = require("../validator/validator")

//<<----------------------------------------------Create Review------------------------------------------------>>
const createReview = async (req, res) => {
    try {
        let bookId=req.params.bookId
        
        //validating bookId
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

        //validating data from request body
        const data = req.body

        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "please enter a valid input" })
        }

        //extracting params
        let {reviewedBy,rating,review}=data     
        let newreview={}
        newreview.bookId=bookId

        //validating reviewer's name
        
        if(!isValid(reviewedBy)){
           
           newreview.reviewedBy='Guest'
        }

        if(isValid(reviewedBy)){
        if(!isValidUser(reviewedBy)){
            return res.status(400).send({ status: false, message: "name of the reviewer is not valid" }) 
        }
        newreview.reviewedBy=reviewedBy
    
    }
       

        //validating rating
        if(!rating){
            return res.status(400).send({ status: false, message: "rating is required" }) 
        }
       
         if(isNaN(Number(rating))){
            return res.status(400).send({ status: false, message: "rating should be a valid number between 1-5" }) 
           }

        if(!isValidRating(rating)){
            return res.status(400).send({ status: false, message: "rating should be between 1-5" }) 
        }
        newreview.rating=rating

        //validating review
        if(review){
            if(!isValid(review)){
                return res.status(400).send({ status: false, message: "review field cannot be empty" }) 
            }
            review=extraspace(review)
            newreview.review=review
        }

        let reviewedAt=Date.now('YYYY/MM/DD:mm:ss')
        newreview.reviewedAt=reviewedAt

        //creating review
        const newReview = await reviewModel.create(newreview)
        const updatedbook=await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:1}},{new:true})
        updatedbook._doc["reviewsData"]=newReview
        res.status(201).send({status : true,message:"success",data : updatedbook})
    }
     catch (error) {
        res.status(500).send({status : false,
        message : error.message})
    }
}

//<<------------------------------------------------Update Review--------------------------------------------->>
const updateReviewById = async (req, res) => {
    try {
        const bookId = req.params.bookId
        //validating bookId
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
        const reviewId = req.params.reviewId
        //validating reviewId
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "invalid reviewId" })
        }

        const reviewExist = await reviewModel.findOne({_id:reviewId,bookId:bookId,isDeleted:false})
        if (!reviewExist) {
            return res.status(404).send({
                status: false,
                message: "review not found! please check reviewId"
            })
        }
        const data = req.body
        if(!isValidRequest(data)){
            return res.status(400).send({ status: false, message: "No data recieved in request to update" })
        }

        //extracting params
        let {reviewedBy,review,rating}=data

        //validating params recived to update
    let update={}
    if(reviewedBy){
        if(!isValid(reviewedBy)){
            return res.status(400).send({ status: false, message: "name of the reviewer field value cannot be empty" }) 
        }

        if(!isValidUser(reviewedBy)){
            return res.status(400).send({ status: false, message: "name of the reviewer is not valid" }) 
        }
        update.reviewedBy=reviewedBy
    }

    if(rating){
           if(!isNaN(Number(rating))){
            return res.status(400).send({ status: false, message: "rating should be a valid number between 1-5" }) 
           }
        if(!isValidRating(rating)){
            return res.status(400).send({ status: false, message: "rating should be between 1-5" }) 
        }
        update.rating=rating
    }

    if(review){
        if(!isValid(review)){
            return res.status(400).send({ status: false, message: "review field value cannot be empty" }) 
        }
        review=extraspace(review)
        update.review=review
    }
        
    const updatedreview = await reviewModel.findOneAndUpdate({_id : reviewId, isDeleted : false},update, {new : true})
          bookExist._doc["reviewsData"]  =updatedreview
          res.status(200).send({status : true,message:"success",data : bookExist})
            
    } catch (error) {
        res.status(500).send({status : false,
        Error : error})
    }
}

//<<-----------------------------------------------Delete Review------------------------------------------->>
const deleteReviewById = async (req, res) => {
    try {
        const bookId = req.params.bookId
        //validating bookId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "invalid bookId" })
        }

        const bookExist = await bookModel.findOne({_id:bookId,isDeleted:false})
        if (!bookExist) {
            return res.status(404).send({
                status: false,
                message: "book not found"
            })
        }
         //validating reviewId
        const reviewId = req.params.reviewId
        
         if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "invalid reviewId" })
        }

        const reviewExist = await reviewModel.findOne({_id:reviewId,bookId:bookId,isDeleted:false})
        if (!reviewExist) {
            return res.status(404).send({
                status: false,
                message: "review not found"
            })
        }
       
        // const time = Date.now('YYYY/MM/DD:mm:ss')
        // const update = { isDeleted: true, deletedAt: time }
        const updatereview = await reviewModel.findOneAndUpdate({_id : reviewId, isDeleted : false}, {$set:{isDeleted : true}})
        const updatedBook = await bookModel.findOneAndUpdate({_id : bookId, isDeleted : false}, {$inc:{reviews:-1}})
        res.status(200).send({status : true,message : "review Deleted Sucessfully"})
        
       
    } catch (error) {
        res.status(500).send({status : false,message : error.message})
    }
}

module.exports = {createReview,updateReviewById,deleteReviewById}