module.exports = function (db, lib) {

    async function create (obj) {
        
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can create Organization")
            e.name = "Unauthorized"
            throw e
        }
        try{
            return db.Category.create({ name: obj.name })
            .then(category =>{
                return category
            }).catch(error =>{
                throw error
            })
        } catch (error) {
            throw error
        }
    }

    async function bulkCreate (obj) {
        
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can create Organization")
            e.name = "Unauthorized"
            throw e
        }
        try{
            return db.Category.bulkCreate(obj.categoryData, {
                validate: true
            })
            .then(category =>{
                category.forEach(element => {
                    delete element.dataValues.createdAt
                    delete element.dataValues.updatedAt 
                });
                return category
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
        if (options && options.search) {
            where = {
                [db.Sequelize.Op.or]: [
                    { name: { [db.Sequelize.Op.like]: `%${options.search}%` } },
                ],
            },
            limit, 
            offset
        }
        if (options && options.name){
            where.name = options.name
        }
        where.LocationId = obj.currentLocationId
        
        return db.Category.findAndCountAll({
            where,
            attributes: ["name"],
            include: [
                {
                    model: db.SubCategory
                }
            ]
        }).then(category =>{
            return category
        }).catch(error =>{
            throw error
        })
    }
    // only CSP can change the category
    async function update(obj, options) {
        
        if (!obj.CSPADMIN) {
            const e = new Error ("Only Cellsmartpos can create Organization")
            e.name = "Unauthorized"
            throw e
        }  
        const category = await db.Category.findOne({
            where: {
                id: obj.id
            }
        })
        if (!category){
            const e = new Error ("Category Not Found")
            throw e
        }
            
        try {
            return category.update(obj, {
                fields: ['name']
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
            const e = new Error ("Only Cellsmartpos can create Organization")
            e.name = "Unauthorized"
            throw e
        }
        const category = await db.Category.findOne({
            where: { id: obj.id }
        })
        if (!category){
            const e = new Error("category not found")
            e.name = "NotFound"
            throw e
        }
        try{
            category.destroy()
            await db.SubCategory.destroy({
                where: {
                    CategoryId: category.id
                }
            })
            return result
        } catch (error) {
            throw error
        }
    }
      
    function getById(obj) {
        const where = {}  
        where.id = obj.id
        return db.Category.findOne({
            where,
            attributes: ["name"],
            // include: [
            //     {model: db.SubCategory}
            // ]
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
