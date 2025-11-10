const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.mongodb_uri;
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

    const cat_db = client.db("categoriesDB");
    const categoriesCollection = cat_db.collection("categories");

    const issue_db = client.db("issuesDb");
    const issuesCollection = issue_db.collection("issues");

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.json(categories);
    });

    app.get("/issues", async (req, res) => {
      try {
        const issuesCollection = client.db("issuesDB").collection("issues");
        const limit = parseInt(req.query.limit) || 0;

        const issues = await issuesCollection
          .find({})
          .sort({ date: -1 })
          .limit(limit)
          .toArray();

        res.status(200).json(issues);
      } catch (error) {
        console.error("Error fetching issues:", error);
        res.status(500).json({ message: "Failed to fetch issues" });
      }
    });

    app.get("/issue/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const issue = await issuesCollection.findOne(query);
      res.json(issue);
    });

    app.post("/issues", async (req, res) => {
      const newCategory = req.body;
      const result = await issuesCollection.insertOne(newCategory);
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
