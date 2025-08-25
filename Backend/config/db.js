const mongoose = require("mongoose")

const connectDb = async ()=>{
       try{
         await mongoose.connect(process.env.MONGO_URI)
         console.log("db connected")
       }catch(e){
         console.log("connect to fail db",e)
       }
}

module.exports = connectDb