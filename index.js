const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://buildwithmeraj_db_user:3xGWeKrSs1HYGmEv@cityfixdata.krf4nxz.mongodb.net/?appName=cityfixData";
const client = new MongoClient(uri, {
  tls: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

async function run() {
  try {
    console.log("Connected to MongoDB Atlas!");

    const db = client.db("categoriesDB");
    const categoriesCollection = db.collection("categories");

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.json(categories);
    });

    app.post("/categories", async (req, res) => {
      const newCategory = req.body;
      const result = await categoriesCollection.insertOne(newCategory);
      res.status(201).json(result);
    });

    app.listen(port, () =>
      console.log(`Server running at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
