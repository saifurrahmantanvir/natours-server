const AppError = require('../utils/appError')

const handleCastErrorDB = err => {
   const message = `Invalid ${err.path}: ${err.value}`

   return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
   const value = Object.values(err.keyValue);
   const message = `Duplicate field value ${value.join(' ')}. Please use another value!`

   return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
   const errors = Object.values(err.errors).map(el => el.message)
   const message = `Invalid input data. ${errors.join('. ')}`

   return new AppError(message, 400)
}

const handleJWTError = () => {
   return new AppError('Invalid token. Please log in again!', 401)
}

const handleJWTExpiredError = () => {
   return new AppError('Your token has expired! Please log in again', 401)
}

const sendErrorDev = (err, req, res) => {
   // API
   if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
         status: err.status,
         error: err,
         message: err.message,
         stack: err.stack
      })
   }
   // RENDERED WEBSITE
   else {
      res.status(err.statusCode).render('error', {
         title: 'Something went wrong!',
         msg: err.message
      })
   }
}

const sendErrorProd = (err, req, res) => {
   // API
   if (req.originalUrl.startsWith('/api')) {
      // Operational,trusted error: send message to client
      if (err.isOperational) {
         res.status(err.statusCode).json({
            status: err.status,
            message: err.message
         })
      }
      // Programming or other unknown error: don't leak error details
      else {
         console.error('Error 💥', err)

         res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
         })
      }
   }
   // RENDERED WEBSITE
   else {
      // Operational,trusted error: send message to client
      if (err.isOperational) {
         res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
         })
      }
      // Programming or other unknown error: don't leak error details
      else {
         console.error('Error 💥', err)

         res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later'
         })
      }
   }
}

module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res)

   } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err };
      error.message = err.message;

      if (err.kind === 'ObjectId') {
         error = handleCastErrorDB(error)
      }

      if (err.code === 11000) {
         error = handleDuplicateFieldsDB(error)
      }

      if (err._message === "Validation failed") {
         error = handleValidationErrorDB(error)
      }

      if (err.name === 'JsonWebTokenError') {
         error = handleJWTError()
      }

      if (err.name === 'TokenExpiredError') {
         error === handleJWTExpiredError()
      }

      sendErrorProd(error, req, res)
   }
}