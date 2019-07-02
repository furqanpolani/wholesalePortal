module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
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
      },
      email: {
        type: DataTypes.STRING(50),
        validate: {
          isUniqueToOrganization(value) {
            return sequelize.models.Employee.find({
              where: {
                OrganizationId: this.getDataValue('OrganizationId'),
                email: value,
              },
            })
              .then((result) => {
                if (result && result.email) { throw new Error('Employee with this email already exist in organization') }
              })
              .catch((error) => {
                throw error
              })
          },
        },
      },
      name: {
        type: new DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
        get() {
          let fullName = ''
          if (this.lastName) { fullName = `${this.firstName} ${this.lastName}` } else { fullName = this.firstName }
          return fullName
        },
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      organizationAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
        allowNull: false
      },
      OrganizationId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      LocationId : {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      phoneNumber: DataTypes.STRING(25),
      password: DataTypes.STRING(500),
      pinCode: {
        type: DataTypes.STRING(20),
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
      gender: DataTypes.STRING(10),
      imageURL: DataTypes.STRING(500),
      verified: DataTypes.BOOLEAN,
      resetPasswordToken: DataTypes.STRING(500),
    }, {
      paranoid: true,
      defaultScope: {
        attributes: {include: ['organizationId', 'LocationId', 'AddressId']},
        attributes: { exclude: ['password', 'pinCode'] }
      },
    })
    
    Employee.beforeCreate(async (employee, options) => {
      const result = await sequelize.models.Employee.findAndCount({
        where: {
          firstName: employee.firstName,
          lastName: employee.lastName,
        },
        transaction: options.transaction,
      })
    })
  
    Employee.beforeUpdate((employee, options) => {
      if (!employee.dataValues.pinCode) { return delete employee.dataValues.pinCode }
    })
    
    // for time being
    Employee.prototype.validPassword = function (password) {
      return new Promise ((resolve, reject) =>{
        if (this.password == password)
        resolve(true)
      else 
        resolve(false)
      })
    }

    Employee.associate = function (db) {
      Employee.belongsTo(db.Location, { foreignKey: 'LocationId', onDelete: 'CASCADE' , allowNull: true})
      Employee.belongsTo(db.Organization, { foreignKey: { field: 'OrganizationId', allowNull: false } })
      // Employee.belongsTo(db.Address)
    }
  
    return Employee
  }
  