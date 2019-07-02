module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
          isUnique(value) {
            return sequelize.models.Category.find({
              where: {
                name: value,
              },
            })
              .then((result) => {
                if (result) {
                  const e =  new Error ('Category name already exist')
                  e.name = "isUnique"
                  e.message = "Category name already exist"
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
      paranoid: true,
    })
  
    Category.associate = function (db) {
      Category.hasMany(db.SubCategory, { foreignKey: { field: 'CategoryId', allowNull: false } })
    }
  
    return Category
  }
  