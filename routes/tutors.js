const express = require("express");
const router = express.Router();
const tutorController = require("../controllers/tutors");
const checkAuth = require("../middlewares/checkAuth");
const roles = require("../lib/constants/account").ROLES;

router.post("/register", tutorController.createTutor);
router.get(
  "/",
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  tutorController.getAllTutors
);
router.get(
  "/:id",
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  tutorController.getTutor
);
router.delete("/:id", checkAuth([roles.ADMIN]), tutorController.deleteTutor);
router.put(
  "/:id",
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  tutorController.updateTutor
);
router.post(
  "/avatar/:username",
  checkAuth([roles.TUTOR]),
  tutorController.uploadTutorAvatar,
  tutorController.updateTutorAvatar
);
router.post(
  "/certificates/:username",
  checkAuth([roles.TUTOR]),
  tutorController.createDirCertificates,
  tutorController.uploadCertificates,
  tutorController.updateTutorCertificates
);
router.post(
  "/video/:username",
  checkAuth([roles.TUTOR]),
  tutorController.uploadVideo,
  tutorController.updateTutorVideo
);
router.get(
  "/video/:username",
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  tutorController.streamVideo
);

module.exports = router;
