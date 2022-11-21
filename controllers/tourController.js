const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const {
   getAll,
   getOne,
   createOne,
   updateOne,
   deleteOne
} = require('./handleFactory')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true)
   } else {
      cb(new AppError('Not an image! Please upload only image', 400), false)
   }
}

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
   { name: 'imageCover', maxCount: 1 },
   { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
   if (!req.files.imageCover || !req.files.images) return next()

   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

   await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)

   req.body.images = []

   await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

      await sharp(file.buffer)
         .resize(2000, 1333)
         .toFormat('jpeg')
         .jpeg({ quality: 90 })
         .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
   }))

   next()
})

/* upload.array('images', 3) */

/* --------
exports.checkID = (req, res, next, val) => {
   if (req.params.id * 1 > tours.length - 1) {
      return res.status(404).json({
         status: 'fail',
         message: 'Invalid ID',
      });
   }
   next();
};

exports.checkBody = (req, res, next) => {
   if (!req.body.name) {
      return res.status(400).json({
         status: 'fail',
         message: 'Bad Request',
      });
   }
   next();
};
-------- */

exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5'
   req.query.sort = '-ratingsAverage,price'
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
   next()
}

exports.getAllTours = getAll(Tour);

/* --------
exports.getAllTours = catchAsync(async (req, res, next) => {
   const features = new APIFeatures(Tour.find(), req.query)
      .filter().sort().limitFields().paginate();
   const tours = await features.query;

   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         tours
      }
   })
})
-------- */

exports.getTour = getOne(Tour, { path: 'reviews' })

/* --------
exports.getTour = catchAsync(async (req, res, next) => {
   const tour = await Tour.findById(req.params.id).populate('reviews')

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   })
})
-------- */

exports.createTour = createOne(Tour);

/* --------
exports.createTour = catchAsync(async (req, res, next) => {
   const newTour = await Tour.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         tour: newTour,
      },
   })
})
-------- */

exports.updateTour = updateOne(Tour);

/* --------
exports.updateTour = catchAsync(async (req, res, next) => {
   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   })

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         tour
      }
   })
})
-------- */

exports.deleteTour = deleteOne(Tour);

/* --------
exports.deleteTour = catchAsync(async (req, res, next) => {
   const tour = await Tour.findByIdAndDelete(req.params.id)

   if (!tour) {
      return next(new AppError('No tour found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: null
   })
})
-------- */

exports.getTourStats = catchAsync(async (req, res, next) => {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
         $group: {
            _id: '$difficulty',
            numTours: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$ratingsAverage' },
            numRatings: { $sum: '$ratingsQuantity' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
         }
      },
      {
         $sort: { avgPrice: 1 }
      }
   ])

   res.status(200).json({
      status: 'success',
      data: {
         stats
      }
   })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   const year = req.params.year * 1;

   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates'
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`)
            }
         }
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }
         }
      },
      {
         $addFields: { month: '$_id' }
      },
      {
         $project: { _id: 0 }
      },
      {
         $sort: { numTourStarts: -1 }
      },
      {
         $limit: 12
      }
   ])

   res.status(200).json({
      status: 'success',
      data: {
         plan
      }
   })
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
   const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',')

   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

   if (!lat || !lng) {
      return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
   }

   const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

   res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
         data: tours
      }
   })
})

exports.getDistances = catchAsync(async (req, res, next) => {
   const { latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',')

   if (!lat || !lng) {
      return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
   }

   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

   const distances = await Tour.aggregate([
      {
         $geoNear: {
            near: {
               type: 'Point',
               coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
         }
      },
      {
         $project: {
            distance: 1,
            name: 1
         }
      }
   ])

   res.status(200).json({
      status: 'success',
      data: {
         data: distances
      }
   })
})