const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();


// middleware : 
app.use(cors());
app.use(express.json());



// connected to database : 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.9gh47.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("warehouse").collection("product");

        app.get('/products',async(req,res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        
    } catch (error) {
        console.log(error);
    }
}

run();




app.get('/',(req,res)=>{
    res.send('warehouse management system is running')
})

app.listen(port,()=>console.log('server is running'));

