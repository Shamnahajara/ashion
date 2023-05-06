const multer = require("multer");
const path = require("path");

function createMulter() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        path.join(__dirname, "../public/public/img/product"),
        function (success, err) {
          if (err) {
            throw err;
          }
        }
      );
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name, function (success, err) {
        if (err) {
          throw err;
        }
      });
    },
  });

  let upload = multer({ storage: storage });
  return upload;
}


function bannerMulter() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        path.join(__dirname, "../public/public/img/banner"),
        function (success, err) {
          if (err) {
            throw err;
          }
        }
      );
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name, function (success, err) {
        if (err) {
          throw err;
        }
      });
    },
  });

  let uploadBanner = multer({ storage: storage });
  return uploadBanner;
}
module.exports = {
  createMulter,
  bannerMulter
};