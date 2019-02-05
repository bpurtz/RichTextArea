const express = require("express");
const router = express.Router();

const {
  multipleImagesUpload,
  singleImageUpload,
  singleVideoUpload,
  deleteMedia
} = require("../services/mediaFunctions");

// @route     POST api/media/profile-picture
// @desc      Post profile picture
// @access    Private
// INCOMPLETE
router.post("/profile-picture", function(req, res) {
  // "image" must be the name of the upload
  // upload data to s3
  singleImageUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({
        errors: [
          { title: "File Upload Error", detail: err.message, total: err }
        ]
      });
    }

    let imageData = {
      imageURL: req.file.location,
      imageKey: req.file.key,
      bucket: req.file.bucket
    };
    // If successful, delete old profile picture
    // update user document to reflext new path
    return res.json(imageData);
  });
});

// @route     POST api/media/pet
// @desc      Post profile picture
// @access    Private
// INCOMPLETE
router.post("/multiple-images", function(req, res) {
  // "photos" must be the name of the upload
  // upload data to s3
  multipleImagesUpload(req, res, error => {
    console.log("files", req.files);
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.files === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success
        let fileArray = req.files,
          fileLocation;
        const galleryImgLocationArray = [];
        for (let i = 0; i < fileArray.length; i++) {
          fileLocation = fileArray[i].location;
          console.log("filenm", fileLocation);
          galleryImgLocationArray.push(fileLocation);
        }
        // Save the file name into database
        res.json({
          filesArray: fileArray,
          locationKeyArray: galleryImgLocationArray
        });
      }
    }
  });
});

// @route     POST api/media/profile-picture
// @desc      Post profile picture
// @access    Private
// INCOMPLETE
router.post("/video", function(req, res) {
  // "video" must be the name of the upload
  // upload data to s3
  singleVideoUpload(req, res, err => {
    if (err) {
      return res.status(422).send({
        errors: [
          { title: "File Upload Error", detail: err.message, total: err }
        ]
      });
    }
    console.log(req);
    return res.json({ videoURL: req.file.location, videoKey: req.file.key });
  });
});

// @route       post /api/media/video
// @desc        upload video, must have name "video"
// @access      Private
router.delete("/delete/:key", function(req, res) {
  deleteMedia(req.params.key)
    .then(data => res.json(data))
    .catch(err => res.json({ errors: { deleteError: err } }));
});

module.exports = router;
