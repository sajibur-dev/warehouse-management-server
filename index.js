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



// jwt verify : 

function verifyJWT(req,res,next){
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send({message:'unauthorize access'})
    }

    const token = authorization.split(' ')[1];
    jwt.verify(token,process.env.SECURE_ACCESS_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:"forbidden"});
        }
        req.decoded = decoded;
        next();
    })
}


// connected to database : 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.9gh47.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("warehouse").collection("product");
        const servicesCollection = client.db("warehouse").collection("service"); 
        const reviewsCollection = client.db("warehouse").collection("review");

        // auth api 

        app.post('/login',async(req,res,)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.SECURE_ACCESS_TOKEN,{
                expiresIn:'30d'
            });
            res.send(token);
        });


        app.get('/products',async(req,res)=>{
            const products = await productCollection.find().toArray();
            res.send(products)
        })

        // load data according to user 

        app.get('/myitems',verifyJWT,async(req,res)=>{
            const decodedEmail = req.decoded.email
            const email = req.query.email;
            const page = +req.query.page;
            const size = +req.query.size;

            if(decodedEmail === email){
                const query = {email:email};
                const cursor = productCollection.find(query);
                const products = page || size ? await cursor.skip(page * size).limit(size).toArray() : await cursor.toArray();
                res.send(products)
            }
        })
        
        // get specific data 


        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        });
       
        // get services collection : 

        app.get('/services',async(req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // get client's review : 

        app.get('/reviews',async(req,res) =>{
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // get specific review : 

        app.get('/review',async(req,res)=>{
            const email = req.query.email;
            const query = {email:email};
            const review = await reviewsCollection.findOne(query);
            const response = review === null ?{ message:`data doesn't exist`} : review
            
            res.send(response)
        })

        // insert single to product Collection

        app.post('/products',async(req,res)=>{
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.send(result)
        });

        // insert single  data to reviews collection : 

        app.post('/reviews',async(req,res)=>{
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result)
        })


        // edit spefic data 

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


        // delete spefic data 

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
    res.send('warehouse management system is runnings')
})

app.listen(port,()=>console.log('server is running',port));

