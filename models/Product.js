const {
  PRODUCTSTATUS
} = require('./../configuration/constantStrings')
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Product name can not be empty!',
          },
          isUnique(value) {
            return sequelize.models.Product.find({
              where: {
                name: value
              },
            })
              .then((result) => {
                if (result) {
                  const e = new Error(`${this.name} already exist`)
                  e.name = 'Conflict'
                  throw e
                }
              })
              .catch((error) => {
                throw error
              })
          },
        },
      },
      inStock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      },
      totalQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      },
      totalSold: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      },
      totalPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: true,
        },
      },
      sellingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      purchaseCost: {
        type: DataTypes.DECIMAL(10, 2),
      },
      upc: {
        type: DataTypes.STRING(100),
        validate: {
          notEmpty: {
            args: true,
            msg: 'Product upc can not be empty!',
          },
          isUnique(value) {
            if (value.length > 0) {
              return sequelize.models.Product.find({
                where: {
                  upc: value
                },
              })
                .then((result) => {
                  if (result) {
                    const e = new Error(`${this.upc} already exist`)
                    e.name = 'Conflict'
                    throw e
                  }
                })
                .catch((error) => {
                  throw error
                })
            }
            return true
          },
        },
      },
      sku: {
        type: DataTypes.STRING(100),
        validate: {
          notEmpty: {
            args: true,
            msg: 'Product sku can not be empty!',
          },
          isUnique(value) {
            if (value.length > 0) {
              return sequelize.models.Product.find({
                where: {
                  sku: value
                },
              })
                .then((result) => {
                  if (result) {
                    const e = new Error(`${this.sku} already exist`)
                    e.name = 'Conflict'
                    throw e
                  }
                })
                .catch((error) => {
                  throw error
                })
            }
            return true
          },
        },
      },
      // brand: DataTypes.STRING,
      description: DataTypes.STRING(500),
      maxPrice: {
        type: DataTypes.INTEGER,
      },
      minPrice: {
        type: DataTypes.INTEGER,
      },
      LocationId: {
        type: DataTypes
      }
      // isActive: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: 1,
      //   allowNull: false
      //   // defaultValue: true,
      // },
    }, {
      paranoid: true,
    })
  
    Product.beforeUpdate((product, options) => sequelize.models.Product.find({
      where: {
        name: product.name,
      },
    })
      .then((result) => {
        if (result && parseInt(result.id) !== parseInt(product.id)) {
          console.log(product.id, result.id)
          const e = new Error(`${this.name} already exist`)
          e.name = 'Conflict'
          throw e
        }
        if (this.upc) this.upc = this.upc.replace(/\s/g, '')
        if (this.sku) this.upc = this.sku.replace(/\s/g, '')
      })
      .catch((error) => {
        throw error
      }))
  
    Product.associate = function (db) {
      Product.belongsTo(db.SubCategory, { foreignKey: 'SubCategoryId', allowNull: false })
      Product.belongsTo(db.Location, {foreignKey: 'LocationId', allowNull: false})
      // Product.hasOne(db.Stock, { foreignKey: 'ProductId', allowNull: false })
      Product.hasMany(db.InvoiceDetail, { foreignKey: 'ProductId', allowNull: false })
    }  
    return Product
  }
