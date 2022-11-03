const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

//middlewares
app.use(cors());
app.use(express.json())

//mongodb connecting


const uri = "mongodb+srv://DB_USER:DB_PASS@cluster0.wxeycza.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//root api
app.get('/',(req,res)=>{
    res.send('Car Server')
})

app.listen(port,()=>{console.log(' CAr server is running');})