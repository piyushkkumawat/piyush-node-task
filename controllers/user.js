const userModal = require("../modal/user.modal");
const db = require('../config/db.config');

const UserModal = db.registration

exports.renderIndex = (req, res) => {
    res.render('index');
  };
  
  exports.renderChangePassword = async(req, res) => {
    const { id } = req.params;
    try {
      // Find the user based on the ID
      const user = await UserModal.findOne({ where: { id } });
      if (!user) {
        // User not found
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.render('changePassword', { user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Failed to fetch user');
    }
  };
  
  exports.renderRegistration = (req, res) => {
    
    res.render('registration');
  };

  exports.renderUserDetails = async(req, res) => {
    const { id } = req.params;
    try {
      // Find the user based on the ID
      const user = await UserModal.findOne({ where: { id } });
  
      if (!user) {
        // User not found
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Render the 'userDetails template and pass the users data
      return res.render('userDetails', { user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Failed to fetch user');
    }
  };

  exports.renderUserList = async(req, res) => {
    try {
      // Fetch all users from the database
      const users = await UserModal.findAll();
  
      // Render the 'user-list' template and pass the users data
     return res.render('user-list', { users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Failed to fetch users');
    }
  };
  

  exports.renderUpdateuser = async(req, res) => {
    const { id } = req.params;
    try {
      // Find the user based on the ID
      const user = await UserModal.findOne({ where: { id } });
  
      if (!user) {
        // User not found
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Render the 'user-list' template and pass the users data
      res.render('editProfile', { user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Failed to fetch user');
    }
  };
  