const express = require("express");
const { connectToMongoDB } = require("./db-connection");
const { ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let notesCollection;

async function initializeDb() {
  const collection = await connectToMongoDB();
  notesCollection = collection;
}

app.get("/notes", async (req, res) => {
  try {
    const query = req.query || {};
    const notes = await notesCollection.find(query).toArray();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.get("/notes/:id", async (req, res) => {
  try {
    const noteId = new ObjectId(req.params.id);
    const note = await notesCollection.findOne({ _id: noteId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the note" });
  }
});

app.post("/notes", async (req, res) => {
  try {
    const newNote = {
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await notesCollection.insertOne(newNote);
    const insertedNote = await notesCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json(insertedNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create a note" });
  }
});

app.put("/notes/:id", async (req, res) => {
  try {
    const noteId = new ObjectId(req.params.id);
    const updatedNote = {
      $set: {
        title: req.body.title,
        content: req.body.content,
        updatedAt: new Date(),
      },
    };
    const result = await notesCollection.findOneAndUpdate(
      { _id: noteId },
      updatedNote,
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update the note" });
  }
});

app.patch("/notes/:id", async (req, res) => {
  try {
    const noteId = new ObjectId(req.params.id);
    const updateFields = { ...req.body, updatedAt: new Date() };
    const result = await notesCollection.findOneAndUpdate(
      { _id: noteId },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    if (!result) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update the note" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    const noteId = new ObjectId(req.params.id);
    const result = await notesCollection.deleteOne({ _id: noteId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the note" });
  }
});

initializeDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
});
