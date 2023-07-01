const db = require('../config/db.config');
const { Op } = require('sequelize');
const fs = require('fs');


const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const UserModal = db.registration
exports.Create = async (req, res) => {
    if (!req.body) {
        res.json({
            status: 500,
            message: "Request body can not be empty",
        });
    }

    const { name, email, phone, password, gender } = req.body;
    try {
        const newUser = new UserModal({
            name: name,
            email: email,
            phone: phone,
            password: password,
            gender: gender
        });

        await newUser.save()
        return res.render('index');
       
    } catch (error) {
        console.error("Failed to create user:", error);
        res.json({
            status: 500,
            message: "Failed to create user",
        });
    }
};


// =====Login====

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user based on the email
        const user = await UserModal.findOne({ where: { email } });
        if (!user) {
            // User not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is active (status 1) or inactive (status 0)
        if (user.status == 0) {
            // User is inactive
            return res.status(401).json({ message: 'User is inactive' });
        } else if (user.status == 1) {
            // Check if the provided password matches the stored password
            if (password !== user.password) {
                // Password doesn't match
                return res.status(401).json({ message: 'Invalid password' });
            }
            return res.status(401).json({ message: 'User is Pending' });

            // Login successful
            //   return res.status(200).json({ message: 'Login successful', user });
        } else if(user.status == 2){
            res.redirect(`/userDetails/${user.id}`);
        }else {
            // Invalid status value
            return res.status(500).json({ message: 'Invalid user status' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
};


//   Update User 

const path = require('path');

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const { name, email, phoneno, password, gender, status } = req.body;
    try {
        // Find the user based on the ID
        const user = await UserModal.findByPk(id);

        if (!user) {
            // User not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user data
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneno) user.phone = phoneno;
        if (password) user.password = password;
        if (gender) user.gender = gender;
        if (status) user.status = status;
        // Handle profile picture upload
        if (req.file) {
            const imagePath = `uploads/${req.file.filename}`;
            user.profile_pic = imagePath;
        }
        // Save the updated user
        await user.save();

        // Return the updated user
        return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('User update error:', error);
        return res.status(500).json({ message: 'User update failed' });
    }
};



//   Get all user API

exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, sort, search } = req.query;

    try {
        // Build the query conditions
        const where = search
            ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ],
            }
            : {};

        // Build the query options
        const options = {
            where,
            order: sort ? [sort.split(':')] : [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit,
        };

        // Fetch the users based on the conditions and options
        const users = await UserModal.findAll(options);

        // Count the total number of users
        const totalUsers = await UserModal.count({ where });
        return res.status(200).json({ message: 'User updated successfully', users, totalUsers, page, limit, sort, search });

        //   res.render('user-list', { users, totalUsers, page, limit, sort, search });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

exports.findOneUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the user based on the ID
        const user = await UserModal.findOne({ where: { id } });

        if (!user) {
            // User not found
            return res.status(404).json({ message: 'User not found' });
        }

        // User found
        return res.status(200).json({ message: 'User found', user });
    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: 'Error finding user' });
    }
};

//   Logout API

exports.logout = (req, res) => {

    res.redirect('/');
};

//   Download CSV file

exports.downloadCsv = async (req, res) => {
    try {
        const users = await UserModal.findAll();
        // Define the CSV file path and headers
        const csvFilePath = './csvFiles/users.csv';
        const csvHeaders = [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'gender', title: 'Gender' },
            { id: 'status', title: 'Status' },
        ];

        // Create a CSV writer instance
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: csvHeaders,
        });

        // Write the data to the CSV file
        await csvWriter.writeRecords(users);

        // Set response headers for CSV file download
        res.setHeader('Content-Disposition', `attachment; filename="${csvFilePath}"`);
        res.setHeader('Content-Type', 'text/csv');

        // Stream the CSV file to the response
        const fileStream = fs.createReadStream(csvFilePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to download CSV' });
    }
};

// Delete User API

exports.deleteUser = async(req, res) => {
    const userId = req.params.id;

    try {
      const deletedUser = await UserModal.destroy({ where: { id: userId } });
  
      if (deletedUser === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.redirect('/');
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.changePassword = async (req, res) => {
    console.log("=====")
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const id = req.params.id;
    try {
      // Fetch the user from the database
      const user = await UserModal.findOne({ where: { id } });

  
      if (currentPassword !== user.password) {
        return res.status(401).json({ message: 'Invalid current password' });
      }
  
      // Check if the new password and confirm password match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
      }
  
      // Update the user's password with the new password
      user.password = newPassword;
  
      // Save the updated user in the database
      await user.save();
  
    //   return res.status(200).json({ message: 'Password changed successfully' });
      res.redirect('/')
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Failed to change password' });
    }
  };
  