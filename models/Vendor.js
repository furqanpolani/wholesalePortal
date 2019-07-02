const {
    VENDORROLE,
    GENDER,
    VENDORSTATUS,
    VENDORAPPROVESTATUS
  } = require('./../configuration/constantStrings')
  module.exports = (sequelize, DataTypes) => {
    const Vendor = sequelize.define('Vendor', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUnique(value) {
            return sequelize.models.Vendor.findOne({
              where: {
                email: value,
              },
            })
              .then((result) => {
                if (result && result.email) { throw new Error('Vendor with this email already exist ') }
              })
              .catch((error) => {
                throw error
              })
          },
        },
  
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      phoneNumber: DataTypes.STRING(25),
      imageURL: DataTypes.STRING,
      gender:{
        type: DataTypes.ENUM(Object.keys(GENDER)),
        allowNull: false
      },
      dob: {
        type: DataTypes.DATE
      },
      LocationId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
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
      
    },
    {
      paranoid: true,
      defaultScope: {
        attributes: { include : [ 'LocationId']}
      }
    })
    Vendor.associate = function (db) {
      // Vendor.belongsTo(db.Address)
      Vendor.belongsTo(db.Location, {foreignKey: "LocationId", allowNull: false})
      Vendor.belongsTo(db.Organization, {forerignKey: "OrganizationId", allowNull: false})

      //Updated
      // Vendor.hasMany(db.Stock, {foreignKey: 'VendorId' })
      // Vendor.hasMany(db.Price, {foreignKey: 'VendorId', allowNull: false })
    }
      // for time being
    Vendor.prototype.validPassword = function (password) {
      return new Promise ((resolve, reject) =>{
        if (this.password == password)
        resolve(true)
      else 
        resolve(false)
      })
    }
    return Vendor
  }
  