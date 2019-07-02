module.exports = (sequelize, DataTypes) => {
    const Location = sequelize.define('Location', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          isUniqueToOrganization(value) {
            return sequelize.models.Location.find({
              where: {
                OrganizationId: this.getDataValue('OrganizationId'),
                name: value,
              },
            })
              .then((result) => {
                if (result && (result.id !== this.getDataValue('id'))) { throw new Error('Location name already exist in organization') }
              })
              .catch((error) => {
                throw error
              })
          },
        },
      },
      type: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      website: {
        type: DataTypes.STRING(100),
      },
      logoURL: {
        type: DataTypes.STRING(500),
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      timeZone: {
        type: DataTypes.STRING(50)
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: false,
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
    }, {
      paranoid: true,
      scopes: {
        receipt: {
        //   attributes: ['id', 'name', 'dba', 'type', 'website', 'timeZone', 'metadata', 'logoURL', 'isActive', 'email'],
          // include: [{ model: sequelize.models.Address }]
        },
      },
    })
  
    Location.associate = function (db) {
        Location.belongsTo(db.Organization, { foreignKey: { field: 'OrganizationId', allowNull: false } })
        // Location.belongsToMany(db.Employee, { foreignKey: 'LocationId', through: { model: db.LocationEmployee }, onDelete: 'CASCADE' })
        // Location.belongsTo(db.Address, { foreignKey: { field: 'AddressId', allowNull: false } })
        Location.hasMany(db.Product)    
        Location.hasMany(db.Invoice)
        Location.hasMany(db.Purchase)
        Location.hasMany(db.Vendor)
        Location.hasMany(db.Customer)

      //   Location.hasMany(db.InvoiceDetail, { foreignKey: { field: 'LocationId', allowNull: false } })
    //   Location.hasMany(db.Invoice, { foreignKey: { field: 'LocationId', allowNull: false } })
    
    }
  
    return Location
  }
  