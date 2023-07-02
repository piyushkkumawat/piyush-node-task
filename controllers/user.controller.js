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
        const user = await UserModal.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.status == 0) {
            return res.status(401).json({ message: 'User is inactive' });
        } else if (user.status == 1) {
            if (password !== user.password) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            return res.status(401).json({ message: 'User is Pending' });

        } else if(user.status == 2){
            res.redirect(`/userDetails/${user.id}`);
        }else {
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
        if (req.file) {
            const imagePath = `uploads/${req.file.filename}`;
            user.profile_pic = imagePath;
        }
        await user.save();

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
        const where = search
            ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ],
            }
            : {};

        const options = {
            where,
            order: sort ? [sort.split(':')] : [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit,
        };

        const users = await UserModal.findAll(options);

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
        const user = await UserModal.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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
        const csvFilePath = './csvFiles/users.csv';
        const csvHeaders = [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'gender', title: 'Gender' },
            { id: 'status', title: 'Status' },
        ];

        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: csvHeaders,
        });

        await csvWriter.writeRecords(users);

        res.setHeader('Content-Disposition', `attachment; filename="${csvFilePath}"`);
        res.setHeader('Content-Type', 'text/csv');

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
      const user = await UserModal.findOne({ where: { id } });

  
      if (currentPassword !== user.password) {
        return res.status(401).json({ message: 'Invalid current password' });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
      }
  
      user.password = newPassword;
  
      await user.save();
  
    //   return res.status(200).json({ message: 'Password changed successfully' });
      res.redirect('/')
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Failed to change password' });
    }
  };
  