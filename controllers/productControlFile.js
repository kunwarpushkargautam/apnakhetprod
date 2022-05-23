const {ProductList} = require('../product');
exports.productControlFunction = (req,res) =>{
    try{
        res.status(200).json({
            products:ProductList
        })
    }catch(err){
       console.log(err)
    }
}