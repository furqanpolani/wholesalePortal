// const { PAYMENTMETHOD, PAYMENTPROCESSOR } = require('../config/constants')

module.exports = function (db, lib) {
  // Terminal ONLY, location required
  /**
   * Create a payment for the given organization
   * obj Requirements
   *  -obj.organization
   * @param {*} obj
   * @param {*} options
   */
  function create(obj, options) {
    const DBSERIAL = lib.DatabaseHelper.serial()
    return lib.DatabaseHelper.transaction(options, DBSERIAL)
      .then(async (options) => {
        try {
          const payment = await db.Payment.create(obj.Payment, options)
          lib.DatabaseHelper.commit(options, DBSERIAL)
          return payment
        } catch (error) {
          lib.DatabaseHelper.rollback(options, DBSERIAL)
          throw error
        }
      })
      .catch((error) => {
        throw error
      })
  }

  /**
   * Update a given payment
   * @param {*} obj
   * @returns Promise({Integer(0/1)}Updated?)
   */
  function update(obj) {
    return db.Payment.update(obj, {
      where: {
        id: obj.id,
      },
    })
      .then(result => result)
      .catch((error) => {
        throw error
      })
  }

  /**
   * Remove given payment for the organization
   * @param {*} obj
   * @returns Promise({Integer(0/1)}Deleted?)
   */
  async function remove(obj, options) {
    const DBSERIAL = lib.DatabaseHelper.serial()
    return lib.DatabaseHelper.transaction(options, DBSERIAL)
      .then(async (options) => {
        try {
          const payment = await db.Payment.find({ where: { id: obj.id } })
          if (!payment) {
            const e = new Error('Payment was not found so unable to remove')
            e.name = 'NotFound'
            throw e
          }
          const invoice = await db.Invoice.find({ where: { id: payment.InvoiceId } })
          if (invoice.closed) invoice.closed = false
          payment.amount = -parseFloat(payment.amount)


          await payment.destroy({ transaction: options.transaction })
          await invoice.save({ transaction: options.transaction })
          await db.Invoice.updatePaymentTotal(payment, options)
          lib.DatabaseHelper.commit(options, DBSERIAL)
          return true
        } catch (error) {
          lib.DatabaseHelper.rollback(options, DBSERIAL)
          throw error
        }
      })
      .catch((error) => {
        throw error
      })
  }

  /**
   * Return all payment for an organization
   * @param {*} obj
   * @returns Promise([Payments])
   */
  function getAll(obj) {
    return db.Payment.findAndCount({
      where: { LocationId: obj.location.id },
    })
      .then(result => result)
      .catch((error) => {
        throw error
      })
  }

  /**
   * Return a specific payment for an organization
   * @param {*} obj
   * @returns Promise(Payment)
   */
  function getById(obj) {
    return db.Payment.find({
      where: {
        id: obj.id,
        LocationId: obj.location.id,
      },
    })
      .then(result => result)
      .catch((error) => {
        throw error
      })
  }

  return {
    create,
    update,
    remove,
    getAll,
    getById,
  }
}
