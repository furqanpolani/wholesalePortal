const {
    GENDER,
    CUSTOMERSTATUS
  } = require('./../configuration/constantStrings')
  module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      fullName: {
        type: new DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
        get() {
          let fullName = ''
          if (this.lastName) { fullName = `${this.firstName} ${this.lastName}` } else { fullName = this.firstName }
          return fullName
        },
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isUnique(value) {
            return sequelize.models.Customer.find({
              where: {
                email: value,
              },
            })
              .then((result) => {
                if (result && result.email) { throw new Error('Customer with this email already exist ') }
              })
              .catch((error) => {
                throw error
              })
          },
        },
  
      },
      phoneNumber: {
        type: DataTypes.STRING(20)
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
  
      },
      imageURL: DataTypes.STRING(500),
      addressLine1: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING(200),
      },
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(20),
      },
      country: {
        type: DataTypes.STRING(20),
      },
      postalCode: {
        type: DataTypes.STRING(20),
      },
      gender:{
        type: DataTypes.ENUM(Object.keys(GENDER)),
        allowNull: false
      },
      dob: {
        type: DataTypes.DATE
      }
    },
    {
      paranoid: true,
    })
    Customer.associate = function (db) {

      Customer.hasMany(db.Invoice, {foreignKey: "CustomerId", allowNull: false})
      Customer.belongsTo(db.Location, { foreignKey: { field: 'LocationId', allowNull: false } })
      Customer.belongsTo(db.Organization, { foreignKey: { field: 'OrganizationId', allowNull: false } })
    }
    return Customer
  }
  