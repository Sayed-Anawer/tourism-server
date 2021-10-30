const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");

const ObjectId = require("mongodb").ObjectId;
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vlj80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Tourism_Database");
    const allToursCollection = database.collection("allToursCollection");
    const userEventCollection = database.collection("userEventCollection");

    // Get all Tours data from database
    app.get("/allTours", async (req, res) => {
      const cursor = allToursCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Insert Trips by place trips
    app.post("/userEventData", async (req, res) => {
      const singleTrip = req.body;
      const userResult = await userEventCollection.insertOne(singleTrip);

      res.json(userResult);
    });

    app.get("/myEvents/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: `${email}` };
      const result = await userEventCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });

    app.delete("/deleteTrip/:tripId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.tripId),
      };

      const result = await userEventCollection.deleteOne(query);

      res.json(result);
      console.log(result);
    });

    // Manage all the users get API

    app.get("/manageAllUsers", async (req, res) => {
      const cursor = userEventCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Manage All events => Users Trip delete API

    app.delete("/deleteUsersTrip/:tripId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.tripId),
      };

      const result = await userEventCollection.deleteOne(query);

      res.json(result);
    });

    // Manage All Events => Users Status pending to approved put API

    app.put("/updateStatus/:statusId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.statusId),
      };
      const filter = query;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `Approved`,
        },
      };
      const result = await userEventCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Add More Trips => Adding more data Post API

    app.post("/addMoreTrips", async (req, res) => {
      const addTrip = req.body;
      const tripResult = await allToursCollection.insertOne(addTrip);

      res.json(tripResult);
    });
  } finally {
    //   await client.close()
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("This is Home server.");
});

app.listen(port, () => console.log(`Server is listening on Port `, port));
