module.exports = (sequelize, DataTypes) => {
    const SubCategory = sequelize.define('SubCategory', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUnique(value) {
            return sequelize.models.SubCategory.find({
              where: {
                name: value,
              },
            })
              .then((result) => {
                if (result) {
                  const e = new Error('Sub Category name already exist')
                  e.name = 'NotUnique'
                  throw e
                }
              })
              .catch((error) => {
                throw error
              })
          },
        },
      },
    }, {
      paranoid: true
    })
  
    SubCategory.associate = function (db) {
      SubCategory.belongsTo(db.Location, {foreignKey: "LocationId", allowNull: false})
      SubCategory.belongsTo(db.Category, {foreignKey: "CategoryId", allowNull: false})
      SubCategory.hasMany(db.Product)
      
    }
  
    return SubCategory
  }
  