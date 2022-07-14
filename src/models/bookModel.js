const mongoose=require("mongoose")
const objectId=mongoose.Schema.Types.ObjectId

const bookSchema=new mongoose.Schema({
    title:{
        type:String,
        required:"title is required",
        unique:true,
        trim:true
    },
    excerpt:{
        type:String,
        required:"excerpt is required",
        trim:true

    },
    userId:{
        type:objectId,
        ref:"User",
        required:true
    },
    ISBN:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    category:{
        type:String,
        required:"category is required",
        trim:true
    },
    subcategory:{
        type:[String],
        required:"subcategory is required",
        trim:true
    },
    reviews:{
        type:Number,
        default:0,
        Comment:"Holds the number of reviews of this book"

    },
    releasedAt:{
        type:Date,
        required:true
    },
    deletedAt:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    bookCover:{
        type:String
    }

},{timestamps:true})

module.exports=mongoose.model("Book",bookSchema)