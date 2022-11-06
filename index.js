const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');
require('dotenv').config();

//middlewares
app.use(cors());
app.use(express.json())

//mongodb connecting
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxeycza.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'uauthorized f'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
        if(err){
            return res.status(401).send({message:'uauthorized f'})
        }
        req.decoded = decoded;
        next()
    })
}

//async function
async function run(){
try{
const serviceCollection= client.db('geniusCar').collection('services');
const orderCollection = client.db('geniusCar').collection('orders');

app.post('/jwt',(req,res)=>{
    const user = req.body;
    console.log(user);
    const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
    res.send({token})
})
   //making a get api
app.get('/services',async(req,res)=>{
const query= {};
 const cursor = serviceCollection.find(query);
 const services= await cursor.toArray();
 res.send(services)
});

//get a specific serviceid using findOne--Read Operation
app.get('/services/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
});

app.get('/orders', verifyJWT,async (req, res) => {
    const decoded = req.decoded;
    console.log('inside orders api',decoded);
    if(decoded.email !== req.query.email){
res.status(403).send({message:'unauthorized access'})
    }
    console.log(req.headers.authorization)       
    let query = {};

    if (req.query.email) {
        query = {
            email: req.query.email
        }
    }

    const cursor = orderCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders);
});
//patch 
app.patch("/orders/:id",verifyJWT,async(req,res)=>{
    const id = req.params.id;
    const status = req.body.status;
    const query = {_id:ObjectId(id)};
    const updatedDoc = {
        $set:{
            status:status
        } 
    }
    const result = await orderCollection.updateOne(query,updatedDoc);
    res.send(result);

})


app.delete('/orders/:id',verifyJWT, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await orderCollection.deleteOne(query);
    res.send(result);
})
//orders API-post
app.post('/orders',verifyJWT,async(req,res)=>{
    const order= req.body;
    const result = await orderCollection.insertOne(order);
    res.send(result)
})

}
finally{

}
}
run().catch(e=>console.log(e))

//root api
app.get('/',(req,res)=>{
    res.send('Car Server')
})

app.listen(port,()=>{console.log(' CAr server is running');})