module.exports = function (db, lib) {

    async function create (obj, options) {
        
        // restriction: only csp and organizaionAdmin can create Location
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }

        // restriction : employee can create location in its registered organization
        if (obj.employee){
            obj.OrganizationId = obj.employee.OrganizationId
        }
        if (!obj.OrganizationId){
            const e = new Error ("Organizaiton Id not provied")
            e.name = "OrganizationIdNotProvided"
            throw e
        }
        const organization = await db.Organization.findOne({where: {id: obj.OrganizationId }})
        if (!organization){
            const e = new Error ("Organizaiton Not Found")
            e.name = "OrganizationNotFound"
            throw e
        }
        try{    
            return db.Location.create({
                name: obj.name,
                type: obj.type,
                email: obj.email,
                website: obj.website,
                logoURL: obj.logoURL,
                isActive: obj.isActive, 
                timeZone: obj.timeZone,
                address: obj.address,
                state: obj.state,
                country: obj.country,
                city: obj.city,
                postalCode: obj.postalCode,
                OrganizationId: organization.id,
            }).then(location =>{
                return location
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
    
    function getAll(obj, options) {
        // restriction: only csp and organizaionAdmin can create Location
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
                    ],
                }
            }
            if (options.name){
                where.name = options.name
            }
            if (options.isActive){
                where.isActive = options.isActive
            }
            if (options.OrganizationId){
                where.OrganizationId = options.OrganizationId
            }
        }
        return db.Location.findAndCountAll({
            where,
            // attributes: ["name", "isActive"],
        }).then(location =>{
            return location
        }).catch(error =>{
            throw error
        })
    }  

    async function update(obj, options) {

        let where = {}
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }        
        if (obj.employee){
            where.OrganizationId = obj.employee.OrganizationId
        }
        where.id = obj.id
        const location = await db.Location.findOne({where: where})
        if (!location){
            const e = new Error ("Location Not Found")
            e.name = "NotFound"
            e.message = "Location Not Found"
            throw e
        }
        try {
            return location.update(obj, {
                where: where
                // fields: ['name'],
            }).then(async result =>{
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
        const location = await db.Location.findOne({where: where})
        if (!location){
            const e = new Error ("Location Not Found")
            e.name = "NotFound"
            throw e
        }
        try{
            return location.destroy().then(result =>{
                return result
            })
        } catch (error) {
            throw error
        }
        
    }
      
    async function getById(obj) {
        if (!obj.CSPADMIN && !(obj.employee)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        let organizationWhere = {}
        let where = {}
        
        if (obj.employee){
            organizationWhere.id = obj.employee.OrganizationId
            where.OrganizationId = obj.employee.OrganizationId
        }
        where.id = obj.id
        return db.Location.findOne({
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

  return {
    create: create,
    getAll: getAll,
    update: update,
    remove: remove,
    getById: getById,
  }
}
