const runPromise = require('../helperFunctions/seqPromise')
module.exports = function (db, lib) {

    
    
    function getAll(obj, options) {
        let where = {};
        const limit = (options && parseInt(options.limit)) ? parseInt(options.limit) : 10
        const offset = (options && parseInt(options.offset)) ? parseInt(options.offset) : 0
        
        // let where = {};

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

        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (!obj.employee.OrganizationId) {
            const e = new Error (" You are not registered to any organizaiton")
            e.name = "NotRegisteredToOrganization"
            throw e
        }
        // it will allow employee without location but he should be admin
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        
        
        return db.Purchase.findAndCountAll({
            where,
            // attributes: ["name"],
            include: [
                {
                    model: db.PurchaseDetail
                }
            ]
        }).then(purchase =>{
            return purchase
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
        if (!obj.employee.OrganizationId) {
            const e = new Error (" You are not registered to any organizaiton")
            e.name = "NotRegisteredToOrganization"
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
        // if (obj.employee.LocationId != obj.LocationId) {
        //     const e = new Error ("Purchase is not allowed to make changes to other Locations")
        //     e.name = 'LocationRestriction'
        //     throw e
        // }
        if (!obj.LocationId) {
            const e = new Error ("Location Not Provided")
            e.name = "LocationNotProvided"
            throw e
        }
        // obj.LocationId = obj.employee.LocationId
        obj.OrganizationId = obj.employee.OrganizationId
        const vendor = await db.Vendor.findOne({
            where: {
                id: obj.VendorId,
                LocationId: obj.LocationId
            }
        })
        if(!vendor){
            const e = new Error ("Vendor not found on this Location")
            e.name = "VendorNotFound"
            throw e
        }
        if (!obj.PurchaseDetails) {
            const  e = new Error ("Purchase Details not porvided")
            e.name = "PurchaseDetailNotProvided"
            throw e 
        }
        try{
            const DBSERIAL = lib.DatabaseHelper.serial()
            return lib.DatabaseHelper.transaction(options, DBSERIAL)
              .then((options) => {
                return db.Purchase.create({
                    totalAmount: 0,
                    status: obj.status, 
                    dueDate: obj.dueDate,
                    notes: obj.notes,
                    LocationId: obj.LocationId,
                    VendorId: obj.VendorId,
                    OrganizationId: obj.employee.OrganizationId
                }, {transaction: options.transaction})
                  .then( (purchase) => {
                      console.log("inside [ut: ", purchase)
                    let totalAmount = 0
                    const promises = []
                    obj.PurchaseDetails.forEach(async purchaseDetail =>{
                        console.log("Inside each function")
                        purchaseDetail.cost = parseInt(purchaseDetail.unitPrice) * parseInt(purchaseDetail.quantity)
                        totalAmount += purchaseDetail.cost
                        purchaseDetail.PurchaseId = purchase.id
                        purchaseDetail.LocationId = obj.employee.LocationId
                        purchaseDetail.OrganizationId = obj.employee.OrganizationId
                        console.log("purcahseDetail is :", purchaseDetail)
                        promises.push(db.PurchaseDetail.create(purchaseDetail, { transaction: options.transaction }))
                        promises.push(
                            db.Product.update({
                                inStock: db.Sequelize.literal(`inStock + ${purchaseDetail.quantity}`)
                            },{
                                where: {
                                    id: purchaseDetail.ProductId
                                },
                                transaction: options.transaction
                            })
                        )
                        
                    })
                    purchase.totalAmount = totalAmount
                    Promise.all(promises)
                    .then(result =>{
                            purchase.save({ transaction: options.transaction }).then(result =>{
                                lib.DatabaseHelper.commit(options, DBSERIAL)
                                return purchase
                            }).catch(error =>{
                                lib.DatabaseHelper.rollback(options, DBSERIAL)
                                throw error    
                            })
                    }).catch(error =>{
                        lib.DatabaseHelper.rollback(options, DBSERIAL)
                        throw error
                    })
                  })
                  .catch((error) => {
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                  })
              })
              .catch((error) => { 
                lib.DatabaseHelper.rollback(options, DBSERIAL)
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
        if (obj.employee.LocationId) {
            where.LocationId = obj.employee.LocationId
        }
        where.OrganizationId =obj.employee.OrganizationId
        const purchase = await db.Purchase.findOne({ where: where})
        if (purchase){
            // if (!obj.employee.organizationAdmin && (obj.employee.LocationId != purchase.LocationId)) {
            //     const e = new Error ("Purchase is not allowed to make changes to other Locations")
            //     e.name = 'LocationRestriction'
            //     throw e
            // }
            const DBSERIAL = lib.DatabaseHelper.serial()
            return lib.DatabaseHelper.transaction(options,DBSERIAL)
            .then(async (options) =>{
                try {
                    return db.Purchase.update(obj, {
                        where: where,
                        fields: ['name','status'],
                    }).then(async result =>{
                        lib.DatabaseHelper.commit(options, DBSERIAL)
                        return result
                    })
                    .catch(error =>{
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                    })
                } catch (error) {
                    lib.DatabaseHelper.rollback(options,DBSERIAL )
                    throw error
                }
            })
            .catch(error => {
            throw error
            })
        } else {
            const e = new Error ("Purchase Not Found")
            e.name = "NotFound"
            throw e
        }
    }

    async function remove (obj, options) {
        if (!obj.employee){
            const e = new Error ("Employee Not Found")
            e.name = "Unauthorized"
        }
        const purchase = await db.Purchase.findOne({
            where: { id: obj.id }
        })
        if (!purchase){
            const e = new Error("purchase not found")
            e.name = "NotFound"
            throw e
        }
        if (obj.employee.LocationId != purchase.LocationId) {
            const e = new Error ("Purchase is not allowed to make changes to other Locations")
            e.name = 'LocationRestriction'
            throw e
        }
        const DBSERIAL = lib.DatabaseHelper.serial()
        return lib.DatabaseHelper.transaction(options,DBSERIAL)
        .then(options =>{
            try {
                return db.purchase.destroy({
                    where: {
                        id: purchase.id
                    }
                }).then(result =>{
                    lib.DatabaseHelper.commit(options, DBSERIAL)
                    return result
                }).catch(error =>{
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                })
            } catch (error) {
                lib.DatabaseHelper.rollback(options,DBSERIAL )
                throw error
            }
        }).catch(error =>{
            lib.DatabaseHelper.rollback(options, DBSERIAL)
            throw error
        })
    }
      
    function getById(obj) {
        if (!obj.employee){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        const where = {}  
        where.id = obj.id
        where.LocationId = obj.employee.LocationId
        return db.Purchase.findOne({
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
