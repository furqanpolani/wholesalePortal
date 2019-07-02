module.exports = function (db, lib) {

    async function create (obj, options) {
        try{

            if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
                const e = new Error ("You are not allowed to do this Action")
                e.name = "Unauthorized"
                throw e
            }
            if (obj.employee){
                obj.OrganizationId = obj.employee.OrganizationId
            }
            if (!obj.OrganizationId){
                const e = new Error ("Organizaiton Id not provied")
                e.name = "OrganizationIdNotProvided"
                throw e
            }
            const organization = await db.Organization.findOne({where:{id: obj.OrganizationId}})
            if (!organization){
                const e = new Error ("Organizaiton Not Found")
                e.name = "OrganizationNotFound"
                throw e
            }
            return db.Employee.create({
                firstName: obj.firstName,
                lastName: obj.lastName,
                email: obj.email,
                role: obj.role,
                organizationAdmin: obj.organizationAdmin,
                phoneNumber: obj.phoneNumber, 
                password: obj.password,
                pinCode: obj.pinCode,
                imageURL: obj.imageURL,
                isActive: obj.isActive,
                addressLine1: obj.addressLine1,
                addressLine2: obj.addressLine2,
                state: obj.state,
                country: obj.country,
                city: obj.city,
                postalCode: obj.postalCode,
                OrganizationId: organization.id,
                LocationId: obj.LocationId
            }).then(employee =>{
                return employee
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
  
    function getAll(obj, options) {
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        let where = {};
        if (obj.employee){
            options.OrganizationId = obj.employee.OrganizationId
            
        }
        if(options){
            if (options.search) {
                where = {
                    [db.Sequelize.Op.or]: [
                        { name: { [db.Sequelize.Op.like]: `%${options.search}%` } },
                        { phoneNumber: { [db.Sequelize.Op.like]: `%${options.search}%` } },
                    ],
                }
            }
            if (options.name) {
                where.name = options.name
            }
            if (options.isActive) {
                where.isActive = options.isActive
            }
            if (options.Organizationid) {
                where.OrganizationId = options.OrganizationId
            }
            if (options.LocationId) {
                where.LocationId = options.LocationId
            }
            if (options.city) {
                where.city = options.city
            }
            if (options.organizationAdmin) {
                where.organization = options.organizationAdmin
            }
            if (options.createdAt) {
                where.createdAt = options.createdAt
            }
            if (options.gender) {
                where.gender = options.gender
            }
        }
        return db.Employee.findAndCountAll({
            where,
            limit,
            offset,
            attributes:[
                "firstName", "lastName","imageURL", "fullName","isActive","ctiy","state",
                "postalCode", "addressLine1", "postalCode", "LocationId", "OrgainzationId"
            ],  
            include: [
                {
                    model: db.Location,
                    attributes:["name","isActive","logoURL"]
                }
            ]
        }).then(employee =>{
            return employee
        }).catch(error =>{
            throw error
        })
    }  

    async function update(obj, options) {
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        let where = {}
        
        if (obj.employee){
            where.OrganizationId = obj.employee.OrganizationId
        }
        where.id = obj.id
        const employee = await db.Employee.findOne({where: where})
        if (!employee){
            const e = new Error ("Employee Not Found")
            e.name = "NotFound"
            throw e
        }
        // const organization = await db.Organization.findOne({where: {id: employee.OrganizationId }})
        // if (!organization){
        //     const e = new Error ("Organizaiton Not Found")
        //     e.name = "OrganizationNotFound"
        //     throw e
        // }
        try {
            return employee.update(obj)
            .then(async result =>{
                return result
            })
            .catch(error =>{
            throw error
            })
        } catch (error) {
            throw error
        }
    }

    async function remove (obj, options) {
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        let where = {}
        
        if (obj.employee){
            where.OrganizationId = obj.employee.OrganizationId
        }
        where.id = obj.id
        const employee = await db.Employee.findOne({where: where})
        if (!employee){
            const e = new Error ("Employee Not Found")
            e.name = "NotFound"
            throw e
        }
        try {
            return employee.remove()
            .then(async result =>{
                return result
            })
            .catch(error =>{
            throw error
            })
        } catch (error) {
            throw error
        }
        
    }
    
  async function getById(obj) {
    if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId )) {
        const e = new Error ("You are not allowed to do this Action")
        e.name = "Unauthorized"
        throw e
    }
    let where = {}
    if (obj.employee){
        if (!obj.employee.organizationAdmin){
            where.LocationId = obj.employee.LocationId
        }
        where.OrganizationId = obj.employee.OrganizationId
    }
    where.id = obj.id
      return db.Employee.findOne({
        where,
      // attributes: ["name"],
      })
      .then(result => {
          return result
      })
      .catch((error) => {
          throw error
      })
  }
  function getByIdForCredentials (obj) {
      return db.Employee.findOne({
          where: {
              id: obj.id
          }
      }).then(employee =>{
          return employee
      })
  }

return {
  create: create,
  getAll: getAll,
  update: update,
  remove: remove,
  getById: getById,
  getByIdForCredentials: getByIdForCredentials 
}
}
