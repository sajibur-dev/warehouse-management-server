const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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


        app.post('/login',async(req,res,)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.SECURE_ACCESS_TOKEN,{
                expiresIn:'1d'
            });
            res.send(token);
        })

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
        });

        app.get('/myitems',async(req,res)=>{
            const email = req.query.email;
            
            const query = {email:email};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)

        })

        app.post('/products',async(req,res)=>{
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.send(result)
        });


        app.put('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const updateData = req.body;
            const filter = {_id:ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name:updateData.name,
                    image:updateData.image,
                    description:updateData.description,
                    price:updateData.price,
                    quantity:updateData.quantity,
                    supplier:updateData.supplier,
                    category:updateData.category
                }
              };
              const result = await  productCollection.updateOne(filter,updateDoc,options);
              res.send(result);
        });


        app.delete('/products/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
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

