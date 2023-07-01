module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('user', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          gender: {
            type: Sequelize.STRING,
            allowNull: false
          },
          phone: {
            type: Sequelize.STRING,
            allowNull: false
          },
          password: {
            type: Sequelize.STRING,
            allowNull: false
          },
          status: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: '1'
          },
          profile_pic: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: '/public/uploads/avatarImg.jpg'
          }
    }, {
      freezeTableName: true
    });
    return User;
  }
