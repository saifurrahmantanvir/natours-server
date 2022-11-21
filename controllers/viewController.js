const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
   const tours = await Tour.find()

   res.status(200).render('overview', {
      title: 'Exciting tours for adventurous people',
      tours
   })
})

exports.getTour = catchAsync(async (req, res, next) => {
   const { slug } = req.params;
   const tour = await Tour.findOne({ slug }).populate({
      path: 'reviews',
      select: 'review rating user'
   })

   if (!tour) {
      return next(new AppError('There is no tour with that name', 404))
   }

   res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour
   })
})

exports.getLoginForm = (req, res) => {
   res.status(200).render('login', {
      title: 'Log into your account'
   })
}

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'Your account'
   })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
   const bookings = await Booking.find({ user: req.user.id })

   const tourIDs = bookings.map(b => b.tour)

   const tours = await Tour.find({ _id: { $in: tourIDs } })

   res.status(200).render('overview', {
      title: 'My Tours',
      tours
   })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
   const { name, email } = req.body
   const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name,
      email
   }, {
      new: true,
      runValidators: true
   })

   res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
   })
})