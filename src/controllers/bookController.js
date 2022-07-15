const bookModel=require("../models/bookModel")
const userModel=require("../models/userModel")
const reviewModel=require("../models/reviewModel")
const aws= require("aws-sdk")
const jwt=require("jsonwebtoken")
const {isValid, 
    isValidName,
    isValidRequest,
    isValidMail,
    isValidMobile,
    isValidUser,
isValidTitle,
checkPassword,
isValidObjectId,
extraspace,
isValidISBN,
checkarray,
isValidDate}=require("../validator/validator")
const { type } = require("express/lib/response")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
        
     // this function will upload file to aws and return the link
     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
     
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "abc/" + file.originalname, //HERE 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
         console.log(data)
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })})
    }

    const addbookcover=async function(req,res){
        try{
            let files= req.files
         
       if(files && files.length>0){
           //upload to s3 and get the uploaded link
           // res.send the link back to frontend/postman
           let uploadedFileURL= await uploadFile( files[0] )
           let bookId=req.params.bookId
           let updatedBook=await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$set:{bookCover:uploadedFileURL}})
           res.status(201).send({status:true,message: "file uploaded succesfully", data: updatedBook})
       }
       else{
           res.status(400).send({ msg: "No file found" })
       }

    
        }
        catch (error) {
            //console.log("hello")
           // console.log(error.message)
            res.status(500).send({status : false,message : error.message})
        }
    }

//<<----------------------------------------------create book--------------------------------------------->>
const createBook = async function(req, res) {
    try {
        const data = req.body;

        if (!isValidRequest(data)) {
            return res.status(400).send({ status: false, message: "please enter a valid input" })
        }

        //extracting params
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data
        let newBook={}
        newBook.userId=userId


         //validating title
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }

        title=title.trim()
        let isTitleAlreadyExist=await bookModel.findOne({title:{$regex:title,$options:"$i"},isDeleted:false})
        if(isTitleAlreadyExist){
            return res.status(409).send({ status: false, message: "book with this title already exist" }) 
        }
        title=extraspace(title)
        newBook.title=title

        //validating excerpt
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt is required" })
        }
        excerpt=extraspace(excerpt)
        newBook.excerpt=excerpt

       //validating ISBN
        if(!isValid(ISBN)){
            return res.status(400).send({status:false,message:"ISBN is required!"})
        }

        if(!isValidISBN(ISBN)){
            return res.status(400).send({status:false,message:"invalid ISBN code"})   
        }

        let isISBNAlreadyExist=await bookModel.findOne({ISBN:ISBN,isDeleted:false})
        if(isISBNAlreadyExist){
            return res.status(409).send({ status: false, message: "book with this ISBN code already exist" }) 
        }
        newBook.ISBN=ISBN


        //validating category
        if(!isValid(category)){
            return res.status(400).send({status:false,message:"category is required!"})
        }

        newBook.category=category

        //validating subcategory
        if(!isValid(subcategory)){
            return res.status(400).send({status:false,message:"subcategory is required!"})
        }
           
       if(Array.isArray(subcategory)){
           let result=checkarray(subcategory)
           if(result!=true){
            return res.status(400).send({status:false,message:result})
           }
       }   
       
       if(typeof(subcategory)=="string"){
       if(!isValid(subcategory))
        return res.status(400).send({status:false,message:"subcategory is required!"})
       }

       newBook.subcategory=subcategory

       if(reviews){
        return res.status(400).send({status:false,message:"you cannot set reviews"})
       }

       //validating releasedAt
       if(!releasedAt){
        return res.status(400).send({status:false,message:"releasedAt field  is required!"})
       }
       
       if(!isValidDate(releasedAt)){
        return res.status(400).send({status:false,message:"Date should be in this format(YYYY-MM-DD)"})
       }
       newBook.releasedAt=releasedAt

     
       //Creating book
        const newbook = await bookModel.create(newBook)
        res.status(201).send({status : true,message:"success",data : newbook})
    } catch (error) {
        res.status(500).send({status : false,message : error.message})
    }
}



//<<-----------------------------------------------get book-------------------------------------------------->>
const getBooks=async function(req,res){
    try{
        const data=req.query
        let {userId,category,subcategory}=data
        const filter={}
        filter.isDeleted=false
        if(!isValidRequest(data)){
            const getbooks=await bookModel.find(filter).select({_id:1,title:1,excerpt:1,userId:1,
                category:1,reviews:1,releasedAt:1}).sort({title:1})
            if(getbooks.length==0){
                return res.status(404).send({status:false,message:"No books found"})
            }
           return  res.status(200).send({status:true,message:"Books list",data:getbooks})

        }
        if(userId){
           
            if (!isValid(userId)) {
                return res.status(400).send({ status: false, message: "userId field is empty" })
            }
            if(!isValidObjectId(userId)){
                return res.status(400).send({status:false,message:"Invalid user Id"})
            }
           let  validuser=await user.findById(userId)
            if(!validuser){
                return res.status(404).send({status:false,message:"user with this Id not found"})
            }
            filter.userId=userId

        }

        if(category){
            if (!isValid(category)) {
                return res.status(400).send({ status: false, message: "category field is empty" })
            }
            filter.category=category
        }
        if(subcategory){
            if (!isValid(subcategory)) {
                return res.status(400).send({ status: false, message: "subcategory field is empty" })
            }
            filter.subcategory=subcategory
        }

        const getbooks=await bookModel.find(filter).select({_id:1,title:1,excerpt:1,userId:1,
            category:1,reviews:1,releasedAt:1}).sort({title:1})
        if(getbooks.length==0){
            return res.status(404).send({status:false,message:"No books found"})
        }
        res.status(200).send({status:true,message:"Books list",data:getbooks})
     }
    catch(err){
        res.status(500).send({status:false,message:err.message})
    }}


//<<------------------------------------------get book by Id--------------------------------------------->>    
const getBookById=async function(req,res){
    try{
        let bookId=req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "invalid bookId" })
        }
        const bookdetail=await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!bookdetail){
            return res.status(404).send({status:false,message:"No books found"}) 
        }
        const reviews=await reviewModel.find({bookId:bookId,isDeleted:false})
        
        bookdetail._doc["reviewsData"]=reviews
        res.status(200).send({status:true,message:"Books list",data:bookdetail})

    }
    catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}


//<<--------------------------------------------Update book by Id------------------------------------------>>
const updateBookById = async (req, res) => {
    try {
        const bookId = req.params.bookId
        const condition = req.body
        if(!isValidRequest(condition)){
            return res.status(400).send({ status: false, message: "please enter a valid input" })
        }

        let {title,excerpt,releasedAt,ISBN}=condition//extracting parms
        let update={}
        
        //validation starts
        if(title){
            if(title.trim()==0){
                return res.status(400).send({ status: false, message: "please send some value in title to update" })
            }
            title=title.trim()
            let isTitleAlreadyExist=await bookModel.findOne({_id:bookId,title:{$regex:title,$options:"$i"},isDeleted:false})
            
            if(isTitleAlreadyExist){
                return res.status(409).send({ status: false, message: "book with this title already exist" }) 
            }
            title=extraspace(title)
            update.title=title
          }

          if(excerpt){
              if(excerpt.trim()==0){
                return res.status(400).send({ status: false, message: "please send some value in excerpt to update" })   
              }
              excerpt=extraspace(excerpt)
              update.excerpt=excerpt
          }

          

          if(releasedAt){
            if(releasedAt.trim()==0){
                return res.status(400).send({ status: false, message: "please send some value in releasedAt to update" })   
              }
            if(!isValidDate(releasedAt)){
                return res.status(400).send({status:false,message:"Date should be in this format(YYYY-MM-DD)"})
               }
              update.releasedAt=releasedAt
            }

            if(ISBN){
                if(!isValidISBN(ISBN)){
                    return res.status(400).send({status:false,message:"invalid ISBN code"})
                }
                let isISBNAlreadyExist=await bookModel.findOne({ISBN:ISBN,_id:bookId,isDeleted:false})
        if(isISBNAlreadyExist){
            return res.status(409).send({ status: false, message: "book with this ISBN code already exist" }) 
        }
                update.ISBN=ISBN
            }
            //validation ends
        const data = await bookModel.findOneAndUpdate({_id : bookId, isDeleted : false}, update, {new : true})
        res.status(200).send({status : true,message:"success",data : data})
    } 
    catch (error) {
        res.status(500).send({status : false,message : error.message})
    }
}


//<<----------------------------------------------delete book by Id--------------------------------------------->>
const deleteBookById = async function(req, res) {
    try {
        
        const bookId = req.params.bookId
        const time = Date.now('YYYY/MM/DD:mm:ss')
        const update = { isDeleted: true, deletedAt: time }
        
        const deletedbook = await bookModel.findOneAndUpdate({_id : bookId, isDeleted : false}, update, {new : true})
        if(deletedbook){
            res.status(200).send({status : true,
            message : "Data Deleted Successfully"})
        }
        else{
            res.status(404).send({status : false,
            message : "No Data with this book Id Found"})
        }

    } catch (error) {
        res.status(500).send({status : false,
        message: error.message}) 
    }
}
module.exports={createBook,getBooks,getBookById,updateBookById,deleteBookById,addbookcover}

