const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}

const error = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  const payload = { success: false, message }
  if (details && process.env.NODE_ENV === 'development') payload.details = details
  return res.status(statusCode).json(payload)
}

const paginate = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({ success: true, message, data, pagination })
}

module.exports = { success, error, paginate }
