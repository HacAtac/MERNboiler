import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded._id)
      if (!req.user) {
        return res.status(500).json({ message: `Issue finding logged in user` })
      }

      if (req.user.isActive === false) {
        return res.status(401).json({ message: 'Not authorized, token failed' })
      }
      next()
    } catch (e) {
      console.log(e)
      res.status(403).json({ message: 'Not authorized, token failed' })
    }
  }
  if (!token) {
    res.status(403).json({ message: 'Not authorized, token failed' })
  }
})

const admin = (...roles) => {
  return (req, res, next) => {
    // check to see if role is included in the roles passed in
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

export { protect, admin }
