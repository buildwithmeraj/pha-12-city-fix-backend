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

    // category db and collection
    const cat_db = client.db("categoriesDB");
    const categoriesCollection = cat_db.collection("categories");

    // issues db and collection
    const issue_db = client.db("issuesDb");
    const issuesCollection = issue_db.collection("issues");

    // contributions db and collection
    const contrib_db = client.db("contributionsDB");
    const contributionsCollection = contrib_db.collection("contributions");

    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.json(categories);
    });

    app.get("/issues", async (req, res) => {
      try {
        const { email, limit } = req.query;
        const parsedLimit = parseInt(limit) || 0;
        let query = {};

        if (email) {
          query = { email: email };
        }
        const issues = await issuesCollection
          .find(query)
          .sort({ date: -1 })
          .limit(parsedLimit)
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
      const newIssue = req.body;
      const result = await issuesCollection.insertOne(newIssue);
      res.status(201).json(result);
    });

    app.get("/contributions", async (req, res) => {
      const { email, id } = req.query;
      let query = {};

      if (email) {
        query = { email: email };
      } else if (id) {
        query = { issueId: id };
      } else {
        res.status(400).json({ message: "Please provide email or id." });
      }
      const contributions = await contributionsCollection.find(query).toArray();
      res.json(contributions);
    });

    app.post("/contributions", async (req, res) => {
      const newContribution = req.body;
      const result = await contributionsCollection.insertOne(newContribution);
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
