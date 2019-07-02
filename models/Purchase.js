const {
    ORDERSTATUS
  } = require('./../configuration/constantStrings')
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM(Object.keys(ORDERSTATUS)),
      defaultValue: ORDERSTATUS.NEW,
      allowNull: false,
    },
    notes: DataTypes.STRING(500),
  },{
    paranoid: true,
    defaultScope: {
    },
  })

  Purchase.associate = function (db) {
    Purchase.hasMany(db.PurchaseDetail)
    Purchase.belongsTo(db.Location, {foreignKey: "LocationId", allowNull: false})
    Purchase.belongsTo(db.Vendor, {foreignKey: "VendorId", allowNull: false})
    Purchase.belongsTo(db.Organization, {foreignKey: "OrganizationId", allowNull: false})
    // Purchase.belongsToMany(db.Customer)
  }

  return Purchase
}
