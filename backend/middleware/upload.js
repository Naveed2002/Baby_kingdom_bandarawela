const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({ storage }).array('images', 10);

const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { uploadMultiple, handleUploadError };
