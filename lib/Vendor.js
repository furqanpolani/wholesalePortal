module.exports = function (db, lib) {

    
    
    function getAll(obj, options) {
        
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.organizationAdmin){
            options.LocationId = obj.employee.LocationId
        }
        
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        let where = {};
        
        if (options && options.search) {
            where = {
                [db.Sequelize.Op.or]: [
                    { firstName: { [db.Sequelize.Op.like]: `%${options.search}%` } },
                ],
            }
        }
        if (options && options.name){
            where.firstName = options.firstName
        }
        if (options && options.LocationId){
            where.LocationId = options.LocationId
        }
        where.OrganizationId = obj.employee.OrganizationId
        return db.Vendor.findAndCountAll({
            where,
            limit,
            offset,
            // attributes: ["name"],
        }).then(vendor =>{
            return vendor
        }).catch(error =>{
            throw error
        })
    }
    
    async function create (obj, options) {
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.organizationAdmin && (obj.employee.LocationId != obj.LocationId) ) {
            const e = new Error ("You are not allowed to make changes to other Locations")
            e.name = 'LocationRestriction'
            throw e
        }
        if (obj.employee.LocationId){
            obj.LocationId = obj.employee.LocationId
        }
        obj.OrganizationId = obj.employee.OrganizationId
        try{
            return db.Vendor.create(obj).then(vendor =>{
                return vendor
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
    
    // only employee can change the employee
    async function update(obj, options) {
        const where = {}
        where.id = obj.id
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        where.OrganizationId = obj.employee.OrganizationId
        const vendor = await db.Vendor.findOne({ where: where})
        
        if (vendor){
            if (obj.employee.LocationId != vendor.LocationId) {
                const e = new Error ("Employee is not allowed to make changes to other Locations")
                e.name = 'LocationRestriction'
                throw e
            }
            try {
                return vendor.update(obj, {
                    // fields: ['name','sellingPrice','purchaseCost','description','maxPrice','minPrice','isActive'],
                }).then(async result =>{
                    return result
                })
                .catch(error =>{
                    throw error
                })
            } catch (error) {
                throw error
            }
            
        } else {
            const e = new Error ("Vendor Not Found")
            e.name = "NotFound"
            throw e
        }
    }

    async function remove (obj, options) {
        const where = {}
        where.id = obj.id
        where.OrganizationId = obj.employee.OrganizationId
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        const vendor = await db.Vendor.findOne({
            where: where
        })
        if (!vendor){
            const e = new Error("vendor not found")
            e.name = "NotFound"
            throw e
        }
        if (obj.employee.LocationId != vendor.LocationId) {
            const e = new Error ("Employee is not allowed to make changes to other Locations")
            e.name = 'LocationRestriction'
            throw e
        }
        try {
            return vendor.destroy().then(result =>{
                return result
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
      
    function getById(obj) {
        const where = {}
        where.id = obj.id
        where.OrganizationId = obj.employee.OrganizationId
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        return db.Vendor.findOne({
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
