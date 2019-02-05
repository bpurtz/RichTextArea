const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3_config = require("./aws-s3");

aws.config.update({
  secretAccessKey: s3_config.SECRET_KEY,
  accessKeyId: s3_config.ACCESS_KEY,
  region: "us-east-2"
});

const s3 = new aws.S3();

function checkImage(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

function checkVideo(file, cb) {
  // Allowed ext
  const filetypes = /mp4|mkv|avchd|avi|wmv|mov/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  // Need to figure out how to test mimetype
  console.log(file.mimetype);
  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Video only!");
  }
}

exports.singleImageUpload = upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "animaldevelopmentmedia",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(null, path.basename(Date.now() + path.extname(file.originalname)));
    }
  }),
  limits: { fileSize: 20000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function(req, file, cb) {
    checkImage(file, cb);
  }
}).single("image");

exports.multipleImagesUpload = upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "animaldevelopmentmedia",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(null, path.basename(Date.now() + path.extname(file.originalname)));
    }
  }),
  limits: { fileSize: 20000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function(req, file, cb) {
    checkImage(file, cb);
  }
}).array("photos", 6); // This number determines how many are allowed toupload

exports.singleVideoUpload = upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "animaldevelopmentmedia",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(null, path.basename(Date.now() + path.extname(file.originalname)));
    }
  }),
  limits: { fileSize: 50000000 }, // In bytes: 5000000 bytes = 5 MB
  fileFilter: function(req, file, cb) {
    checkVideo(file, cb);
  }
}).single("video");

exports.deleteMedia = key => {
  var params = {
    Bucket: "animaldevelopmentmedia",
    Key: key
  };
  s3.deleteObject(params, function(err, data) {
    return new Promise(function(resolve, reject) {
      if (data) {
        console.log("File deleted successfully");
        resolve(data);
      } else {
        console.log("Check if you have sufficient permissions : " + err);
        reject(err);
      }
    });
  });
};
