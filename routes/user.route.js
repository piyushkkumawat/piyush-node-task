const express = require('express');
const multer = require('multer');
const router = express.Router();
const userForm = require('../controllers/user');
const user = require("../controllers/user.controller")


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); 
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  
const upload = multer({ storage });

router.get('/', userForm.renderIndex);
router.get('/registration',userForm.renderRegistration);
router.get('/user-list',userForm.renderUserList);
router.get('/editProfile/:id', userForm.renderUpdateuser)
router.get('/userDetails/:id', userForm.renderUserDetails)
router.get('/changepassword/:id', userForm.renderChangePassword)

router.post('/createRegistration', user.Create);
router.post('/login', user.login);
router.post('/userUpdate/:id', upload.single('profile_pic'), user.updateUser);
router.get('/users', user.getAllUsers);
router.get('/download-csv', user.downloadCsv);

router.get('/logout', user.logout);
router.get('/deleteUser/:id', user.deleteUser);
router.post('/changepassword/:id', user.changePassword);




module.exports = router;
