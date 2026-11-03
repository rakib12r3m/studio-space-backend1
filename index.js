import express, { json } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
const app = express() 
const PORT = 8000 

app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}


const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studio-space") 
const studioCollection = db.collection("studio") 
const bookingCollection = db.collection("bookings")



app.post('/add-studio', async(req, res)=>{
const data = req.body 
const result = await studioCollection.insertOne(data) 
  console.log(result, 'from data');

    res.send(result)
})


app.get('/studios',async (req, res) => {
    const result = await studioCollection.find().toArray()
    res.send(result)
})




app.get('/studios/:id', async (req, res)=>{
  const {id} =  req.params 
  const result = await studioCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

// ---
app.get('/featured-studios', async (req, res) => {
  const result = await studioCollection.find().toArray();
  res.send(result);
});
// ---

// studio listing
  app.get('/my-listings/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await studioCollection
      .find({ ownerEmail: email })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch listings" });
  }
});



app.delete('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid studio ID" });
    }

    const result = await studioCollection.deleteOne({
      _id: new ObjectId(id),
      ownerEmail: email
    });

    if (!result.deletedCount) {
      return res.status(404).send({ message: "Studio not found" });
    }

    res.send({ message: "Studio deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete studio" });
  }
});


app.patch('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid studio ID" });
    }

    const {
      title,
      category,
      location,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      imageUrl,
      amenities,
      overview
    } = req.body;

    const result = await studioCollection.updateOne(
      {
        _id: new ObjectId(id),
        ownerEmail: email
      },
      {
        $set: {
          title,
          category,
          location,
          hourlyRate,
          securityDeposit,
          maxCapacity,
          imageUrl,
          amenities,
          overview
        }
      }
    );

    if (!result.matchedCount) {
      return res.status(404).send({ message: "Studio not found" });
    }

    res.send({ message: "Studio updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Failed to update studio" });
  }
});


// end here

app.post('/bookings', async (req, res) => {
  const data = req.body
  const result = await bookingCollection.insertOne(data) 
  res.send(result); 
})

app.get('/my-bookings/:email', async(req, res)=>{
  const {email} =  req.params 
  const result = await bookingCollection.find({email:email}).toArray()
  res.send(result)
})

// ------------------
app.get('/bookings/:id/:date', async (req, res) => {
  const { id, date } = req.params;

  const result = await bookingCollection.find({
    id: id,
    bookingDate: date
  }).toArray();

  res.send(result);
});
// -------------------


// http://localhost:8000/my-bookings/:email
app.get('/', (req, res)=>{
  res.send({msg:"server is running..."})
})

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
    
})