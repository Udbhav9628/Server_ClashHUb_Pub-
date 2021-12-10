const Errror_Handler = require('../utils/errorhandler');

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 404;
    err.Message = err.Message || 'some error occured';
    res.status(err.statusCode).send({
        success:false,
        error:err.Message,
    });
}