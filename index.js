const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
let cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Tokenkey = process.env.Key
app.use(cors())
app.use(express.json())
const uri = `${process.env.MongoUri}`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

   
    const alluserCollection = client.db("HouseHunter").collection("users");
//Registration api
    app.post('/users', async (req, res) => {

      let { name, number, email, password, role } = req.body
      const hashpassword = await bcrypt.hash(password, 10)
      let query = { email: email }
      const existUser = await alluserCollection.findOne(query)
      if (existUser) {
        return res.send({ message: "already exist" })
      }

      const result = await alluserCollection.insertOne({ name, number, email, hashpassword, role })
      res.send(result)
    })

//log ins api

app.post('/loggeduser', async (req,res)=>{

try {
  const {email,password}  = req.body;
  const user = await alluserCollection.findOne({email})
  if (!user) {
    return res.send({message:'user not valid'})
  }

  const isPasswordOK= await bcrypt.compare(password,user.hashpassword)
  if (!isPasswordOK) {
    return res.send ({message:'Password not valid'})
  }
const token = jwt.sign({userId:user._id},Tokenkey,{expiresIn:'1h'})
res.send({message:'log in success'})
} catch (error) {
  console.log(error);
  res.status(500).json({ error: 'Error logging in' })
}


})

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})