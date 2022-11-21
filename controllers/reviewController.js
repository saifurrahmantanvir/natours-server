const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const {
   getAll,
   getOne,
   createOne,
   updateOne,
   deleteOne
} = require('./handleFactory')

exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);

exports.setTourUserIds = (req, res, next) => {
   if (!req.body.tour) req.body.tour = req.params.tourId;
   if (!req.body.user) req.body.user = req.user.id;
   next()
}
exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);