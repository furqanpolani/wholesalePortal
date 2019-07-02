module.exports = (sequelize, DataTypes) => {
    const ApiUser = sequelize.define('ApiUser', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      clientName: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          isUnique(value) {
            return sequelize.models.ApiUser.find({
              where: {
                clientName: value,
              },
            })
              .then((result) => {
                if (result && result.clientName) { throw new Error('Client with this name already exist ') }
              })
              .catch((error) => {
                throw error
              })
          },
        },
      },
      apiKey: {
        type: DataTypes.STRING(500),
        unique: true,
        allowNull: false,
      },
      CSPSecret: {
        type: DataTypes.STRING(500)
      },
      secret: DataTypes.STRING(500),
    },{
      paranoid: true,
    })
  
    return ApiUser
  }