module.exports = function (db, lib) {

    async function create(obj, options) {
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.organizationAdmin){
            obj.LocationId = obj.employee.LocationId    
        }
        if (!obj.LocationId){
            const e = new Error ("Location not provided")
            throw e
        }
        const category = await db.Category.findOne({
            where: {id: obj.CategoryId }
        })
        if (!category){
            const e = new Error ("Category Not Found")
            e.name = "NotFound"
            throw e
        }
        return db.SubCategory.create({
            name: obj.name,
            CategoryId: category.id
        })
        .then((subCategory) => {
            return subCategory
        })
        .catch((error) => {
            throw error
        })
    }

    async function bulkCreate (obj) {
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        
        if (!obj.employee.organizationAdmin){
            obj.LocationId = obj.employee.LocationId    
        }
        if (!obj.LocationId){
            const e = new Error ("Location not provided")
            throw e
        }
        obj.subCategoryData.forEach(data =>{
            data.LocationId = obj.LocationId 
        })
        try{
            return db.SubCategory.bulkCreate(obj.subCategoryData, {
                validate: true
            })
            .then(subCategory =>{
                subCategory.forEach(element => {
                    delete element.dataValues.createdAt
                    delete element.dataValues.updatedAt    
                });
                
                return subCategory
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }
    
    function getAll(obj, options) {
        
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        let where = {};
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.organizationAdmin){
            where.LocationId = obj.employee.LocationId    
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
        
        return db.SubCategory.findAndCountAll({
            where,
            limit,
            offset,
            attributes: ["name"],
            include: [
                {
                    model: db.Category,
                    attributes: ["name"]
                }
            ]
        }).then(subCategory =>{
            return subCategory
        }).catch(error =>{
            throw error
        })
    }  
    
    // only employee can change the subCategory
    async function update(obj, options) {
        const where = {}
        where.id = obj.id
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.organizationAdmin){
            where.LocationId = obj.employee.LocationId    
        }
        if (!obj.LocationId){
            const e = new Error ("Location not provided")
            throw e
        }
        
        let subCategory = await db.SubCategory.findOne({ where: where})
        if (!subCategory){
            const e = new Error ("SubCategory Not Found")
            e.name = "NotFound"
            throw e
        }
            
        try {
            return subCategory.update(obj, {
                fields: ['name'],
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
        try{
            const where = {}
            where.id = obj.id
            if (!obj.employee){
                const e = new Error ("You are not Allowed to do this Action")
                e.name = "Unauthorized"
                throw e
            }
            if (!obj.employee.organizationAdmin){
                where.LocationId = obj.employee.LocationId    
            }
            if (!obj.LocationId){
                const e = new Error ("Location not provided")
                throw e
            }
            const subCategory = await db.SubCategory.findOne({
                where: where
            })
            if (!subCategory){
                const e = new Error("subCategory not found")
                e.name = "NotFound"
                throw e
            }
            return subCategory.destroy()
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
        if (!obj.employee.organizationAdmin){
            where.LocationId = obj.employee.LocationId    
        }
        return db.SubCategory.findOne({
        where,
        attributes: ["name"],
        include: [
            {
                model: db.Category,
                attributes: ["name"]
            }
        ]
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
    bulkCreate: bulkCreate,
    getAll: getAll,
    update: update,
    remove: remove,
    getById: getById,
  }
}
