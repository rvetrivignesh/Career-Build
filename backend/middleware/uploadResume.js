import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  
  if (!allowedMimeTypes.includes(file.mimetype) && fileExtension !== "docx" && fileExtension !== "pdf") {
    const error = new Error("Invalid file type. Only PDF and DOCX files are allowed.");
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("resumeFile");

export const uploadResumeMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: ["File size is too large. Maximum size allowed is 5MB."],
          });
        }
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: [err.message],
        });
      }
      // Pass validation-like error
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [err.message],
      });
    }
    
    // Ensure file exists in the request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: ["resumeFile is required"],
      });
    }

    next();
  });
};
