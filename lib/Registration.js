const jwt = require('jsonwebtoken')
const config = require('../configuration/config')()

module.exports = function (db, lib) {

  function signUp(obj, options) {
    return db.Employee.find({
      where: {
        email: obj.email,
      },
    })
      .then(async (employee) => {
        if (employee) {
          const e = new Error('Employee with this email already exist!')
          e.name = 'Conflict'
          throw e
        } else {
          try{
            return db.Employee.create({
              firstName: obj.firstName,
              lastName: obj.lastName,
              email: obj.email,
              phoneNumber: obj.phoneNumber,
              dob: obj.dob,
              gender: obj.gender,
              isActive:obj.isActive,
              role: obj.role,
              password: obj.password,
              OrganizationId: obj.OrganizationId,
              LocationId: obj.LocationId,
              imageURL: obj.imageURL,
              addressLine1: obj.addressLine1,
              addressLine2: obj.addressLine2,
              state: obj.state,
              country: obj.country,
              city: obj.city,
              postalCode: obj.postalCode 

            })
            .then((employee) => {
              delete employee.dataValues.password
              return sendVerficationEmail(employee)
            })
            .catch((error) => {
              throw error
            })
          } catch(error){
            throw error
          }
        }
      })
  }

  function sendVerficationEmail(employee) {
    const token = jwt.sign({ email: employee.email }, config.secret, { expiresIn: '2hr' })

    const email = {
      to: employee.email,
      subject: 'Please verify your email address',
      html: `<p>Almost Done!<p>
            <p>We just need to verify your email address before your sign up is complete!</p>
             <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <a href="http://localhost:3000/employee/verify?token=${token}&email=${employee.email}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 3px; background-color: #EB7035; border-top: 12px solid #EB7035; border-bottom: 12px solid #EB7035; border-right: 18px solid #EB7035; border-left: 18px solid #EB7035; display: inline-block;">Login &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`,
      text: `We just need to verify your email address before your sign up is complete! \n\n 
      http://localhost:3000/employee/verify?token=${token}&email=${employee.email}`,
    }

    return lib.Sendgrid.send(email)
      .then(result => [1])
      .catch((error) => {
        throw error
      })
  }

  function resendVerifyEmail(obj, options) {
    if (!obj.email) {
      const e = new Error('Email is required in order to send verification.')
      e.name = 'EmailRequired'
      throw e
    }

    return db.Employee.findOne({
      where: {
        email: obj.email,
      },
    })
      .then((employee) => {
        if (employee) {
          if (!employee.verified) {
            return sendVerficationEmail(employee)
          }
          const e = new Error('employee has been already verified')
          e.name = 'Conflict'
          throw e
        } else {
          const e = new Error('employee was not found')
          e.name = 'NotFound'
          throw e
        }
      })
      .catch((error) => {
        throw error
      })
  }

  function verifyEmail(obj, options) {
    return jwt.verify(obj.token, config.secret, (error, payload) => {
      if (error) {
        throw error
      } else {
        return db.Employee.findOne({
          where: {
            email: payload.email,
          },
        })
          .then((employee) => {
            if (employee) {
              if (employee.verified) throw new Error('User already verified.')
              employee.verified = true
              return employee.save()
                .then(() => {
                  return employee
                })
                .catch((error) => {
                  throw error
                })
            }
            const e = new Error('Email was not found.')
            e.name = 'NotFound'
            throw e
          })
          .catch((error) => {
            throw error
          })
      }
    })
  }

  return {
    signUp,
    verifyEmail,
    resendVerifyEmail,
  }
}
