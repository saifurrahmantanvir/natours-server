const express = require('express')
const {
   getOverview,
   getTour,
   getLoginForm,
   getAccount,
   getMyTours,
   updateUserData
} = require('../controllers/viewController')
const { isLoggedIn, protect } = require('../controllers/authController')
const { createBookingCheckout } = require('../controllers/bookingController')


const router = express.Router();

router.post('/submit-user-data', protect, updateUserData)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyTours)

router.use(isLoggedIn)

router.get('/', createBookingCheckout, getOverview)
router.get('/login', getLoginForm)
router.get('/tour/:slug', getTour)


module.exports = router;