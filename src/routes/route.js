const express=require("express")

const userController=require("../controllers/userController")
const bookController=require("../controllers/bookController")
const reviewController=require("../controllers/reviewController")
const {authentication,authorization,createAuthorize}=require("../middleware/auth")
const reviewModel = require("../models/reviewModel")
const router = express.Router();

//<<----------------------------------------------User API----------------------------------------------->>
router.post('/register',userController.registerUser)
router.post('/login',userController.login)

//<<-------------------------------------------Book API-------------------------------------------------->>
router.post('/books',authentication,createAuthorize,bookController.createBook)
router.get('/books',authentication,bookController.getBooks)
router.get('/books/:bookId',authentication,bookController.getBookById)
router.put('/books/:bookId',authentication,authorization,bookController.updateBookById)
router.delete('/books/:bookId',authentication,authorization,bookController.deleteBookById)

//<<------------------------------------------Review API---------------------------------------------------->>
router.post('/books/:bookId/review',reviewController.createReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updateReviewById)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReviewById)

router.post('/addbookcover',bookController.addbookcover)
module.exports = router;