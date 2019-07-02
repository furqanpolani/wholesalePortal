module.exports = function (db, lib) {

    
    
    function getAll(obj, options) {
        
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        let where = {};
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            options.LocationId = obj.employee.LocationId
        }

        if (options && options.search) {
            where = {
                [db.Sequelize.Op.or]: [
                    { name: { [db.Sequelize.Op.like]: `%${options.search}%` } },
                ],
            }
        }
        if (options && options.name){
            where.name = options.name
        }
        if (options && options.LocationId){
            where.LocationId = options.LocationId
        }
        
        return db.Product.findAndCountAll({
            where,
            limit,
            offset,
        //     include: [
        //         {
        //             model: db.SubCategory
        //         }
        //     ]
        }).then(product =>{
            return product
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
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            obj.LocationId = obj.employee.LocationId
        }
        if (!obj.LocationId){
            const e = new Error ("Location Id not Provided")
            throw e
        }
        try{
            return db.Product.create(obj)
                .then((product) => {
                    return product
            })
            .catch((error) => {
                throw error
            })
        } catch (error) {
            throw error
        }
    }
    
    // only employee can change the product
    async function update(obj, options) {
        const where = {}
        where.id = obj.id
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        
        const product = await db.Product.findOne({ where: where})
        if (product){
            try {
                return product.update(obj, {
                    fields: ['name','sellingPrice','purchaseCost','description','maxPrice','minPrice','isActive'],
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
            const e = new Error ("Product Not Found")
            e.name = "NotFound"
            throw e
        }
    }

    async function remove (obj, options) {
        const where = {}
        where.id = obj.id
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        let product = await db.Product.findOne({
            where: where
        })
        if (!product){
            const e = new Error("product not found")
            e.name = "NotFound"
            throw e
        }
        try {
            return db.Product.destroy().then(result =>{
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
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        return db.Product.findOne({
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
