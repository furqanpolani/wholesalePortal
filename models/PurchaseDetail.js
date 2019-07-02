const {
  ORDERDETAILSTATUS
} = require('./../configuration/constantStrings')
module.exports = (sequelize, DataTypes) => {
    const PurchaseDetail = sequelize.define('PurchaseDetail', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      cost: {
        type: DataTypes.DECIMAL
      },
      notes: DataTypes.STRING(500),
    }, {
      paranoid: true
    })
  
    PurchaseDetail.associate = function (db) {
        PurchaseDetail.belongsTo(db.Purchase, {foreignKey: "PurchaseId", allowNull:false})
        PurchaseDetail.belongsTo(db.Product, {foreignKey: "ProductId", allowNull:false})

    }
  
    return PurchaseDetail
  }
  