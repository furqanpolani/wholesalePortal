module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(20),
        defaultValue: 'sale',
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Type can not be empty string!',
          },
        },
      },
      surchargeTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 0.00,
      },
      paymentTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 0.00,
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 0.00,
      },
      grandTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 0.00,
      },
      closed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      returned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        
      },
      dueAmount: {
        type: new DataTypes.VIRTUAL(DataTypes.DECIMAL(10, 2), ['closed', 'paymentTotal', 'grandTotal']),
        get() {
          return (this.grandTotal - this.paymentTotal) ? (Math.round((this.grandTotal - this.paymentTotal) * 100) / 100) : 0
        },
      },
      description: DataTypes.STRING(500),
      forgiven: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    }, {
      paranoid: true,
    })
  
    Invoice.associate = function (db) {
      Invoice.belongsTo(db.Organization, { foreignKey: { field: 'OrganizationId', allowNull: false } })
      Invoice.belongsTo(db.Employee, { foreignKey: { field: 'EmployeeId', allowNull: false } })
      Invoice.belongsTo(db.Location, { foreignKey: { field: 'LocationId', allowNull: false } })
      Invoice.belongsTo(db.Customer, { foreignKey: { field: 'CustomerId', allowNull: false } })
      Invoice.hasMany(db.InvoiceDetail, { foreignKey: 'InvoiceId', onDelete: 'CASCADE', hooks: true })
      Invoice.hasMany(db.Payment, { foreignKey: 'InvoiceId', allowNull: false })
      
    }
    return Invoice
  }
  