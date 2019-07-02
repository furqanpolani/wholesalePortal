
module.exports = (sequelize, DataTypes) => {
  const InvoiceDetail = sequelize.define('InvoiceDetail', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      validate: {
        notEmpty: true,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        zeroValue(value) {
          if (value === 0) { throw new Error('Quantity can no t be  zero ') }
        }
      },
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      defaultValue: 0.00,
    },
    surcharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    serialNumber: DataTypes.STRING,
  }, {
    paranoid: true,
  })

  // InvoiceDetail.beforeCreate((detail, options) => {

  //   // make sure product id exist for product sales
  //   if (!detail.ProductId) {
  //     throw new Error('ProductId is required for Sales')
  //   }
  //   if (detail.ProductId) {
  //     return sequelize.models.Product.find({
  //       where: {
  //         id: detail.ProductId,
  //       },
  //       include: [{ model: sequelize.models.SubCategory, }]})
  //       .then((product) => {
  //         if (!product) throw new Error('Product inside invoice was not found')
  //         return undefined
  //       })
  //       .catch((error) => {
  //         throw error
  //       })
  //   }
  //   return undefined
  // })

  InvoiceDetail.associate = function (db) {
    InvoiceDetail.belongsTo(db.Product, { foreignKey: 'ProductId' , allowNull :false},)
    InvoiceDetail.belongsTo(db.Invoice, { foreignKey: 'InvoiceId', onDelete: 'CASCADE', hooks: true })
  }
  return InvoiceDetail
}
