module.exports = (sequelize, DataTypes) => {
    const Stock = sequelize.define('Stock', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      totalQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      },
      inStock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      }
    }, {
      paranoid: true,
    })

    Stock.associate = function (db) {
      Stock.belongsTo(db.Product, { foreignKey: { field: 'ProductId', allowNull: false } })
    }
  
    return Stock
  }
  