
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    phoneNumber: DataTypes.STRING(25),
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: DataTypes.STRING(200),
  }, {
    paranoid: true,
    validate: {
      not_unique() {
        return sequelize.models.Organization.find({
          where: {
            name: this.name,
            email: this.email,
          },
        })
          .then((result) => {
            if (result) { throw new Error('Organization name already exist with current email.') }
          })
      },
    },
  })

  Organization.associate = function (db) {
    Organization.hasMany(db.Employee, { foreignKey: 'OrganizationId', onDelete: 'CASCADE' })
    Organization.hasMany(db.Location, { foreignKey: 'OrganizationId', onDelete: 'CASCADE' })
  }
  return Organization
}
