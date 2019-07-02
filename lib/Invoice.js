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
        where.OrganizationId = obj.employee.OrganizationId
        // it will allow employee without location but he should be admin
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        return db.Invoice.findAndCountAll({
            where,
            // attributes: ["name"],
            include: [
                {
                    model: db.InvoiceDetail
                }
            ]
        }).then(invoice =>{
            return invoice
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
        //     const e = new Error ("Invoice is not allowed to make changes to other Locations")
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
        const customer = await db.Customer.findOne({
            where: {
                id: obj.CustomerId,
                LocationId: obj.LocationId
            }
        })
        if(!customer){
            const e = new Error ("Customer not found on this Location")
            e.name = "CustomerNotFound"
            throw e
        }
        if (!obj.InvoiceDetails) {
            const  e = new Error ("Invoice Details not porvided")
            e.name = "InvoiceDetailNotProvided"
            throw e 
        }
        const DBSERIAL = lib.DatabaseHelper.serial()
        return lib.DatabaseHelper.transaction(options, DBSERIAL)
        .then((options) => {
            try{
                return db.Invoice.create({
                    description: obj.description,
                    OrganizationId: obj.employee.OrganizationId,
                    closed: obj.closed,
                    LocationId: obj.LocationId,
                    CustomerId: obj.CustomerId,
                    EmployeeId: obj.employee.id
                },{
                    transaction: options.transaction
                })
                .then( async (invoice) => {
                    const promises = []
                    await settingUpDetails(obj, invoice, promises, options);
                    return Promise.all(promises)
                    .then(async promisesResult =>{
                        //payment
                        if (obj.Payment) {
                            obj.Payment.EmployeeId = obj.employee.id
                            obj.Payment.InvoiceId = invoice.id
                            obj.Payment.amount = parseFloat(obj.Payment.amount)
                            obj.Payment.LocationId = obj.LocationId
                              
                            // let Payment = await pay(obj, { transaction: options.transaction })
                            const Payment = await lib.Payment.create(obj, { transaction: options.transaction })
                            if (Payment) {
                                await checkDueAmount(Payment, invoice)
                                invoice.paymentTotal = Payment.amount
                                // await setPaymentTotal(Payment, invoice)
                            }
                        }
                        return invoice.save({ transaction: options.transaction }).then(result =>{
                            lib.DatabaseHelper.commit(options, DBSERIAL)
                            return invoice
                            
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
            } catch (error) {
                lib.DatabaseHelper.rollback(options, DBSERIAL)
                throw error
            }
        })
            .catch((error) => { 
            lib.DatabaseHelper.rollback(options, DBSERIAL)
            throw error
        })
    }

    function settingUpDetails (obj, invoice, promises, options){
        let subTotal = 0.00
        let surchargeTotal = 0
        obj.InvoiceDetails.forEach(async invoiceDetail =>{
            subTotal += (parseFloat(invoiceDetail.cost) * parseInt(invoiceDetail.quantity))
            surchargeTotal += (parseFloat(invoiceDetail.surcharge) * parseInt(invoiceDetail.quantity))
            invoiceDetail.subTotal = (parseFloat(invoiceDetail.cost) * parseInt(invoiceDetail.quantity))
            invoiceDetail.LocationId = obj.LocationId
            invoiceDetail.InvoiceId = invoice.id
            //pushing  InvoiceDetail create functionality in promise
            promises.push(db.InvoiceDetail.create(invoiceDetail, { transaction: options.transaction }))
            // pushing updateStock function in promise
            promises.push(updateStock(invoiceDetail, options))
            
        })
        invoice.subTotal = subTotal
        invoice.surchargeTotal = surchargeTotal
        invoice.grandTotal = invoice.subTotal + invoice.surchargeTotal
        return promises
    }

    function checkDueAmount (payment, invoice) {
        if (invoice.grandTotal > 0 && payment.amount == invoice.grandTotal){
            invoice.closed = true
            return true
        }
        else if (invoice.grandTotal > 0 && payment.amount < invoice.grandTotal){
            invoice.dueAmount = Math.round((invoice.grandTotal - payment.amount) * 100) / 100
            invoice.closed = true
            return true
        }
        else if ((payment.amount > invoice.grandTotal) && (invoice.grandTotal > 0)) {
            const e = new Error(`Payment exceeds invoice grand total.\nDue Amount is $${invoice.grandTotal} and amount paid is $${payment.amount}.`)
            // e.name = 'OverPayment'
            throw e
        }
    }

    // function setPaymentTotal (payment, invoice) {
    //     return invoice.paymentTotal += payment.amount
    // }
    async function updateStock (data, options) {
        if (data.id){
            previousDetail = await db.InvoiceDetail.findOne({
                where: {
                    id: data.id
                }
            })
            if (data.returned){
                return db.Product.update({
                    inStock: db.Sequelize.literal(`inStock + ${parseInt(previousDetail.quantity)}`)
                    
                },{
                    where: {
                        id: data.ProductId
                    },
                    transaction: options.transaction
                }).catch(error =>{
                    throw error
                })
            } else {
                return db.Product.update({
                    inStock: db.Sequelize.literal(`inStock + ${parseInt(previousDetail.quantity)} - ${data.quantity}`)
                    
                },{
                    where: {
                        id: data.ProductId
                    },
                    transaction: options.transaction
                }).catch(error =>{
                    throw error
                })
            }
        } else {
            return db.Product.update(
                {
                    inStock: db.Sequelize.literal(`inStock - ${data.quantity}`)
                },{
                where: {
                    id: data.ProductId,

                },
                transaction: options.transaction
            }).then(result =>{
                return result
            }).catch(error =>{
                throw error
            })
        }
    }

    function update(obj, options) {
        // Find the invoice / done
        // if shift is closed then throw error / done
        // start the transaction / done
        // loop through the details if any and update them, deleting or adding anything changed / done
        // get the new grandtotal of the invoicedetails and update the invoice along with any other changes / done
        // if the grandtotal changes then a payment object is required to update the payments made
    
        return db.Invoice.find({
          where: {
            id: obj.id,
          },
          include: [{ model: db.InvoiceDetail }],
        })
          .then((invoice) => {
            if (invoice) {
              const DBSERIAL = lib.DatabaseHelper.serial()
              return lib.DatabaseHelper.transaction(options, DBSERIAL)
                .then(async (options) => {
                  if (obj.InvoiceDetails) {
                    const promises = []
                    await setUpdateData(obj, invoice, promises, options);
                    let subTotal = 0.00
                    let surchargeTotal = 0
                    // previous work
                    // obj.InvoiceDetails.forEach(async invoiceDetail =>{
                    //     subTotal += (parseFloat(invoiceDetail.cost) * parseInt(invoiceDetail.quantity))
                    //     surchargeTotal += (parseFloat(invoiceDetail.surcharge) * parseInt(invoiceDetail.quantity))
                    //     invoiceDetail.subTotal = (parseFloat(invoiceDetail.cost) * parseInt(invoiceDetail.quantity))
                    //     invoiceDetail.LocationId = obj.LocationId
                    //     invoiceDetail.InvoiceId = invoice.id
                    //     // pushing updateStock function in promise
                    //     await promises.push(updateStock(invoiceDetail, options))
                    //     //pushing  InvoiceDetail create functionality in promise
                    //     await promises.push(updateDetail(invoiceDetail, invoice, options))
                    // })
                    // // invoice.subTotal = subTotal
                    // // invoice.surchargeTotal = surchargeTotal
                    // // invoice.grandTotal = invoice.subTotal + invoice.surchargeTotal


                    return Promise.all(promises)
                        .then(async promisesResult =>{
                            if(promisesResult){

                            
                            //payment
                            
                            // if (obj.Payment) {
                            //     if (obj.Payment.id){

                            //         const previousPayment =await db.Payment.findOne({
                            //             where:{id: obj.Payment.id}
                            //         })
                            //         if (previousPayment) {
                            //             obj.Payment.amount = parseFloat(obj.Payment.amount)
                            //             invoice.dueAmount = parseFloat(invoice.grandTotal) - obj.Payment.amount
                            //             checkDueAmount(obj.Payment, invoice)
                            //             invoice.PaymentTotal = Payment.amount
                            //             const Payment = await lib.Payment.update(obj.Payment, {
                            //                 where: {id: obj.Payment.id},
                            //                 transaction: options.transaction
                            //             })
                            //         }
                            //     } else {

                            //         obj.Payment.EmployeeId = obj.employee.id
                            //         obj.Payment.InvoiceId = invoice.id
                            //         obj.Payment.amount = parseFloat(obj.Payment.amount)
                            //         obj.Payment.LocationId = obj.LocationId
                                    
                            //         // let Payment = await pay(obj, { transaction: options.transaction })
                            //         const Payment = await lib.Payment.create(obj, { transaction: options.transaction })
                            //         if (Payment) {
                            //             await checkDueAmount(Payment, invoice)
                            //             invoice.paymentTotal = Payment.amount
                            //         }
                            //     }
                            // }
                                return invoice.save({ transaction: options.transaction }).then(result =>{
                                    lib.DatabaseHelper.commit(options, DBSERIAL)
                                    return invoice
                                    
                                }).catch(error =>{
                                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                                    throw error    
                                })
                            }
                        }).catch(error =>{
                            lib.DatabaseHelper.rollback(options, DBSERIAL)
                            throw error
                        })
                        
                    }
                    // return invoice
                    })
                    .catch((error) => {
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                    })
            }
            const e = new Error('Invoice not found')
            e.name = 'NotFound'
            throw e
          })
          .catch((error) => {
            throw error
          })
          
      }
      async function setUpdateData(obj, invoice, promises, options){
        let subTotal = 0.00
        let surchargeTotal = 0
        return new Promise (async (resolve, reject) =>{
            payment = await db.Payment.findOne({where:{InvoiceId: invoice.id}})
            if (obj.returned && !payment){
                const e =  new Error ("Payment not  found while returning")
                throw e
            }
        
            obj.InvoiceDetails.forEach(async (invoiceDetail, index) =>{
                invoiceDetail.subTotal = (parseFloat(invoiceDetail.cost) * parseInt(invoiceDetail.quantity))
                invoiceDetail.LocationId = obj.LocationId
                invoiceDetail.InvoiceId = invoice.id
                // pushing updateStock function in promise
                await promises.push(updateStock(invoiceDetail, options))
                if (invoiceDetail.id) {
                    // return db.obj.InvoiceDetails.findOne()
                    if (invoiceDetail.returned) {
                        db.InvoiceDetail.findOne({
                            where: {id: invoiceDetail.id, InvoiceId: invoice.id}
                        }).then(async detail =>{
                            if (detail){
                                await promises.push(db.InvoiceDetail.destroy({where: {id: detail.id}, transaction: options.transaction}))
                                invoice.subTotal = parseFloat(invoice.subTotal) - parseFloat(result.subTotal)
                                invoice.surchargeTotal =  parseFloat(invoice.surchargeTotal) - (parseInt(result.quantity) * parseFloat(result.surcharge))
                                invoice.grandTotal = invoice.subTotal + invoice.surchargeTotal
                                payment.amount = parseFloat(payment.amount) - parseFloat(result.subTotal) - (parseInt(result.quantity) * parseFloat(result.surcharge))
                            } else {
                                const e = new Error ("invoiceDetail not found")
                                throw e
                            }
                        }).catch(error =>{
                            throw error
                        })
                    } else {
                        const previousDetails = await db.InvoiceDetail.findOne({
                            where: {id: invoiceDetail.id, InvoiceId: invoice.id}
                        })
        
                            if (previousDetails){
                                console.log("subTotal before statement",subTotal)
                                console.log("parseFloat(invoiceDetail.subTotal)", parseFloat(invoiceDetail.subTotal))
                                console.log("parseFloat(previousDetails.subTotal)", parseFloat(previousDetails.subTotal))
                                subTotal = subTotal + parseFloat(invoiceDetail.subTotal) - parseFloat(previousDetails.subTotal)
                                console.log("subTotal after statement",subTotal)
                                surchargeTotal = surchargeTotal +  (parseFloat(invoiceDetail.surcharge) * parseInt(invoiceDetail.quantity)) - ((parseFloat(previousDetails.surcharge) * parseInt(previousDetails.quantity)))
                                console.log((parseFloat(invoiceDetail.surcharge) * parseInt(invoiceDetail.quantity)) - ((parseFloat(previousDetails.surcharge) * parseInt(previousDetails.quantity))))
                                promises.push(db.InvoiceDetail.update(invoiceDetail,{
                                        where: {id: invoiceDetail.id},
                                        transaction: options.transaction
                                }))
                                if (obj.InvoiceDetails.length == (index + 1)){
                                    resolve(previousDetails)
                                }
                                
                            } else {
                                const e = new Error ("invoiceDetail not found")
                                throw e
                            }
                    }
                }
            })
        }).then(result =>{
            return payment.save({ transaction: options.transaction }).then(result =>{
                // lib.DatabaseHelper.commit(options, DBSERIAL)
                
                console.log('subTotal is :', subTotal)
                console.log('surchargeTotal is :', surchargeTotal)
                console.log('invoice.grandTotal is :', invoice.grandTotal)
                var total = invoice.grandTotal
                console.log('total', parseFloat(invoice.grandTotal))
                invoice.subTotal = parseFloat(invoice.subTotal) +  subTotal
                invoice.surchargeTotal = parseFloat(invoice.surchargeTotal) + surchargeTotal
                invoice.grandTotal = parseFloat(invoice.grandTotal) + subTotal + surchargeTotal
                console.log('invoice.surgargeTotal is :', invoice.grandTotal)
                if (invoice.grandTotal > parseFloat(invoice.paymentTotal) && invoice.grandTotal > 0 ){
                    invoice.closed = false
                } 
                if (invoice.grandTotal > parseFloat(invoice.paymentTotal) && invoice.grandTotal > 0 ){
                    invoice.closed = true  
                }
                // invoice.save()
                return promises
                
            }).catch(error =>{
                lib.DatabaseHelper.rollback(options, DBSERIAL)
                throw error    
            })
        }).catch(error =>{
            throw error
        })
       
      }
    //   function updateDetail(InvoiceDetail, invoice, options) {
    //     // If id exist then we are updating, if not we are going to create a new row
    //     if (InvoiceDetail.id) {
    //         // return db.InvoiceDetail.findOne()
    //       if (InvoiceDetail.returned) {
    //         return db.InvoiceDetail.findOne({
    //             where: {id: InvoiceDetail.id, InvoiceId: invoice.id}
    //         }).then(invoiceDetail =>{
    //             if (invoiceDetail){
    //                 invoiceDetail.destroy({
    //                     transaction: options.transaction}).then(result=>{
    //                     invoice.subTotal = parseFloat(invoice.subTotal) - parseFloat(result.subTotal)
    //                     invoice.surchargeTotal =  parseFloat(invoice.surchargeTotal) - (parseInt(result.quantity) * parseFloat(result.surcharge))
    //                     invoice.grandTotal = invoice.subTotal + invoice.surchargeTotal
    //                 }).catch(error =>{
    //                     throw error
    //                 })
    //             } else {
    //                 const e = new Error ("invoiceDetail not found")
    //                 throw e
    //             }
    //         }).catch(error =>{
    //             throw error
    //         })
    //       } else {
    //         return db.InvoiceDetail.findOne({
    //             where: {id: InvoiceDetail.id, InvoiceId: invoice.id}
    //         }).then(async invoiceDetail =>{
    //             if (invoiceDetail){
    //                 return await db.InvoiceDetail.update(InvoiceDetail,{
    //                     where:{
    //                         id: InvoiceDetail.id
    //                     },
    //                     transaction: options.transaction
    //                 }).then(result=>{
    //                     invoice.subTotal = parseFloat(invoice.subTotal) - parseFloat(invoiceDetail.subTotal) + parseFloat(InvoiceDetail.subTotal)
    //                     invoice.surchargeTotal =  parseFloat(invoice.surchargeTotal) + (parseFloat(InvoiceDetail.surcharge) * parseInt(InvoiceDetail.quantity)) - ((parseFloat(invoiceDetail.surcharge) * parseInt(invoiceDetail.quantity)))
    //                     invoice.grandTotal = invoice.subTotal + invoice.surchargeTotal
    //                     if (invoice.grandTotal > parseFloat(invoice.paymentTotal) && invoice.grandTotal > 0 ){
    //                         invoice.closed = false
    //                     } 
    //                     if (invoice.grandTotal > parseFloat(invoice.paymentTotal) && invoice.grandTotal > 0 ){
    //                         invoice.closed = true
    //                     }
    //                     console.log('invoie is :', invoice)
    //                     return invoice.save()
    //                 }).catch(error =>{
    //                     throw error
    //                 })
    //             } else {
    //                 const e = new Error ("invoiceDetail not found")
    //                 throw e
    //             }
    //         })
    //       }
    //     //   return db.InvoiceDetail.update(invoiceDetail, {
    //     //     where: {
    //     //       id: invoiceDetail.id,
    //     //       InvoiceId: invoiceDetail.InvoiceId,
    //     //     },
    //     //     fields: ['name', 'quantity', 'cost', 'subTotal', 'discount'],
    //     //     individualHooks: true,
    //     //     transaction: options.transaction,
    //     //   })
    //     //     .spread((updated, invoiceDetail) => {
    //     //       if (!updated) { throw new Error('Not found') }
    //     //       return invoiceDetail[0]
    //     //     })
    //     //     .catch((error) => {
    //     //       throw error
    //     //     })
    //     }else {
    //     return db.InvoiceDetail.create(
    //       invoiceDetail,
    //       {
    //         individualHooks: true,
    //         transaction: options.transaction,
    //       },
    //     )
    //       .then(newDetail => newDetail)
    //     }
    //   }

    async function remove (obj, options) {
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
        if (obj.employee.LocationId && !obj.employee.organizationAdmin){
            obj.LocationId = obj.employee.LocationId
        }
        // if (obj.employee.LocationId != obj.LocationId) {
        //     const e = new Error ("Invoice is not allowed to make changes to other Locations")
        //     e.name = 'LocationRestriction'
        //     throw e
        // }
        if (!obj.LocationId) {
            const e = new Error ("Location Not Provided")
            e.name = "LocationNotProvided"
            throw e
        }
        obj.OrganizationId = obj.employee.OrganizationId
        const invoice = await db.Invoice.findOne({
            where: {
                id: obj.id,
                LocationId: obj.employee.LocationId,
                OrganizationId: obj.employee.OrganizationId
            },
            include: [
                {
                    model: db.InvoiceDetail
                }
            ]
        })
        if(!invoice){
            const e = new Error ("Invoice not found on this Location")
            e.name = "NotFound"
            throw e
        }
        const DBSERIAL = lib.DatabaseHelper.serial()
        return lib.DatabaseHelper.transaction(options,DBSERIAL)
        .then(options =>{
            try {
                if (invoice.closed){
                return invoice.destroy().then(result =>{
                    return db.InvoiceDetail.destroy({
                        where: {
                            InvoiceId: invoice.id
                        }
                    }).then(result =>{
                        lib.DatabaseHelper.commit(options, DBSERIAL)
                        return result
                    }).catch(error =>{
                        lib.DatabaseHelper.rollback(options, DBSERIAL)
                        throw error
                    })
                }).catch(error =>{
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                })
            } else if (obj.returned) {
                let promises =  []
                //have to update stock
                invoice.InvoiceDetail.forEach(invoiceDetail =>{
                    promises.push(updateStock(
                        {
                        quantity: (invoiceDetail.quantity * -1),
                        ProductId: invoiceDetail.ProductId
                        },options)
                    )
                })
                return Promise.all(promises)
                    .then(result =>{
                        // return db.InvoiceDetail.destroy({
                        //     where: {
                        //         InvoiceId: invoice.id
                        //     },transaction: options.transaction
                        // }).then(invoiceDetail =>{
                        return invoice.InvoiceDetail.destroy().then(invoiceDetail =>{
                            return invoice.destroy().then(invoice =>{
                                lib.DatabaseHelper.commit(options, DBSERIAL)
                                return invoice
                            }).catch(error =>{
                                lib.DatabaseHelper.rollback(options, DBSERIAL)
                                throw error
                            })
                        }).catch(error =>{
                            lib.DatabaseHelper.rollback(options, DBSERIAL)
                            throw error
                        })
                    }).catch(error =>{
                        lib.DatabaseHelper.rollback(options, DBSERIAL)
                        throw error
                    })
            } else {
                // when products are not returned
                return db.InvoiceDetail.destroy({
                    where: {
                        InvoiceId: invoice.id
                    },transaction: options.transaction
                }).then(invoiceDetail =>{
                    return db.Invoice.destroy({
                        where: {
                            id: invoice.id
                        },transaction: options.transaction
                    }).then(invoice =>{
                        lib.DatabaseHelper.commit(options, DBSERIAL)
                        return invoice
                    }).catch(error =>{
                        lib.DatabaseHelper.robbbbbllback(options, DBSERIAL)
                        throw error
                    })
                }).catch(error =>{
                    lib.DatabaseHelper.rollback(options, DBSERIAL)
                    throw error
                })
            }
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
        where.OrganizationId = obj.employee.OrganizationId
        // it will allow employee without location but he should be admin
        if (!obj.employee.LocationId && !obj.employee.organizationAdmin){
            const e = new Error ("You are not Allowed to do this Action")
            e.name = "Unauthorized"
            throw e
        }
        if (obj.employee.LocationId){
            where.LocationId = obj.employee.LocationId
        }
        where.id = obj.id
        where.OrganizationId = obj.employee.OrganizationId
        return db.Invoice.findOne({
            where,
            // attributes: ["name"],
            include: [
                {model: db.InvoiceDetail}
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
    getAll: getAll,
    update: update,
    remove: remove,
    getById: getById,
  }
}
