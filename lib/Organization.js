module.exports = function (db, lib) {

    function create (obj) {
        try{
            if (!obj.CSPADMIN) {
                const e = new Error ("Only Cellsmartpos can create Organization")
                e.name = "Unauthorized"
                throw e
            }
            return db.Organization.create(obj)
            .then(organization =>{
                return organization
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
    
    function getAll(obj, options) {
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can access")
            e.name = "Unauthorized"
            throw e
        }
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        let where = {};
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
        }
        return db.Organization.findAndCountAll({
            where,
            // attributes: ["name", "isActive"],
            include: [
                {
                    model: db.Location
                }
            ]
        }).then(organization =>{
            return organization
        }).catch(error =>{
            throw error
        })
    }  

    async function update(obj, options) {
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can access")
            e.name = "Unauthorized"
            throw e
        }
        const organization = await db.Organization.findOne({ where: {id: obj.id}})
        if (!organization){
            const e = new Error ("Organization Not Found")
            e.name = "NotFound"
            throw e
        }
        try {
            return organization.update(obj, {
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

    async function remove (obj) {
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can access")
            e.name = "Unauthorized"
            throw e
        }
        const organization = await db.Organization.findOne({
            where: { id: obj.id }
        })
        if (!organization){
            const e = new Error("organization not found")
            e.name = "NotFound"
            throw e
        } 
        return organization.destroy().then(result =>{
            return result
        })
    }
    
    //restriction: only organizationAdmin and CSP can access 
    function getById(obj) {
        const where = {}
        if (!obj.CSPADMIN && !(obj.employee && obj.employee.OrganizationId && obj.employee.organizationAdmin)) {
            const e = new Error ("You are not allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee){
            obj.id = obj.employee.OrganizationId
        }
        where.id = obj.id
        return db.Organization.findOne({
        where,
        include: [
            {
                model: db.Location,
                // include: [
                //     {model: db.Employee}, { model: db.Vendor }, {model: db.Customer},
                    
                // ]
            
            }
        ]
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
