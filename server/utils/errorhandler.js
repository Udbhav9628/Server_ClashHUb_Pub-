class Errror_Handler extends Error{ //Errror_Handler class is extends of node's default error class
    constructor(Message , statusCode){
        super(Message)   //calling the constructure of Error class

        this.statusCode = statusCode
        error.captureStackTrace(this,this.constructor)
    }
}

module.exports = Errror_Handler;