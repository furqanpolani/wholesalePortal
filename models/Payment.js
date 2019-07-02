module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      surcharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 0.00,
      },
      note: DataTypes.STRING(200),
    }, {
      paranoid: true,
    })
  
    Payment.associate = function (db) {
      Payment.belongsTo(db.Invoice, { foreignKey: { field: 'InvoiceId', allowNull: false } })
      Payment.belongsTo(db.Location, { foreignKey: { field: 'LocationId', allowNull: false } })
      Payment.belongsTo(db.Employee, { foreignKey: { field: 'EmployeeId', allowNull: false } })
    }
  
    return Payment
  }
  