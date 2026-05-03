const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;
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
  res.send(`
    <html>
      <head>
        <title>CityFix API</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            background-color: #f9fafb;
            color: #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          h1 {
            color: #2563eb;
          }
          a {
            color: #ef4444;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .box {
            background: white;
            padding: 2rem 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>CityFix Backend API</h1>
          <p>This is the backend server for the CityFix project.</p>
          <p>Please visit the frontend site:</p>
          <a href="https://city-fix.pages.dev">Go to CityFix Frontend</a>
        </div>
      </body>
    </html>
  `);
});

const isValidObjectId = (id) => ObjectId.isValid(id);

const toObjectIdOrNull = (id) => {
  if (!isValidObjectId(id)) return null;
  return new ObjectId(id);
};

const pickIssueUpdateFields = (payload) => {
  const allowedFields = [
    "title",
    "description",
    "category",
    "location",
    "image",
    "status",
    "date",
    "email",
    "name",
    "upvotes",
  ];

  const updateDoc = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updateDoc[field] = payload[field];
    }
  }
  return updateDoc;
};

async function run() {
  try {
    //await client.connect();
    //console.log("Connected to MongoDB!");

    // Databases & Collections
    const categoriesCollection = client
      .db("categoriesDB")
      .collection("categories");
    const issuesCollection = client.db("issuesDb").collection("issues");
    const contributionsCollection = client
      .db("contributionsDB")
      .collection("contributions");

    app.get("/categories", async (req, res) => {
      try {
        const categories = await categoriesCollection.find({}).toArray();
        res.json(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
      }
    });

    app.get("/issues", async (req, res) => {
      try {
        const { email, limit, category, status } = req.query;
        const parsedLimit = parseInt(limit) || 0;

        const query = {};
        if (email) query.email = email;
        if (category && category !== "All") query.category = category;
        if (status && status !== "All") query.status = status;

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
      try {
        const objectId = toObjectIdOrNull(req.params.id);
        if (!objectId) {
          return res.status(400).json({ message: "Invalid issue id format" });
        }

        const issue = await issuesCollection.findOne({ _id: objectId });
        if (!issue) {
          return res.status(404).json({ message: "Issue not found" });
        }
        res.json(issue);
      } catch (error) {
        console.error("Error fetching issue:", error);
        res.status(500).json({ message: "Failed to fetch issue" });
      }
    });

    app.post("/issues", async (req, res) => {
      try {
        const result = await issuesCollection.insertOne(req.body);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error adding issue:", error);
        res.status(500).json({ message: "Failed to add issue" });
      }
    });

    app.put("/issue/:id", async (req, res) => {
      try {
        const objectId = toObjectIdOrNull(req.params.id);
        if (!objectId) {
          return res.status(400).json({ message: "Invalid issue id format" });
        }

        const safeUpdate = pickIssueUpdateFields(req.body || {});
        if (Object.keys(safeUpdate).length === 0) {
          return res.status(400).json({ message: "No valid fields to update" });
        }

        const result = await issuesCollection.updateOne(
          { _id: objectId },
          { $set: safeUpdate }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Issue not found" });
        }

        res.json(result);
      } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ message: "Failed to update issue" });
      }
    });

    app.delete("/issue/:id", async (req, res) => {
      try {
        const objectId = toObjectIdOrNull(req.params.id);
        if (!objectId) {
          return res.status(400).json({ message: "Invalid issue id format" });
        }

        const result = await issuesCollection.deleteOne({
          _id: objectId,
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Issue not found" });
        }
        res.json(result);
      } catch (error) {
        console.error("Error deleting issue:", error);
        res.status(500).json({ message: "Failed to delete issue" });
      }
    });

    app.get("/contributions", async (req, res) => {
      try {
        const { email, id } = req.query;
        let query = {};
        if (email) query.email = email;
        else if (id) query.issueId = id;
        else
          return res
            .status(400)
            .json({ message: "Please provide email or id." });

        const contributions = await contributionsCollection
          .find(query)
          .toArray();
        res.json(contributions);
      } catch (error) {
        console.error("Error fetching contributions:", error);
        res.status(500).json({ message: "Failed to fetch contributions" });
      }
    });

    app.post("/contributions", async (req, res) => {
      try {
        const result = await contributionsCollection.insertOne(req.body);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error adding contribution:", error);
        res.status(500).json({ message: "Failed to add contribution" });
      }
    });

    app.listen(port, () => {
      console.log(`Server running at port: ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

process.on("SIGINT", async () => {
  //await client.close();
  //console.log("MongoDB connection closed.");
  //process.exit(0);
});
