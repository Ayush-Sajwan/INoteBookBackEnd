const express = require('express');
const Note = require('../schemas/noteSchema');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

const router = express.Router();

//Route 1 for getting all the notes
router.get("/fetchAllNotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user_id: req.user.id })

        res.json(notes);

    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }

});


//Route 2 for adding a note
router.post("/addNote",
    //checking if the request is valid or not
    body('title', 'Title length should be greater than 3').isLength({ min: 3 }),
    body('description', 'Description length should be greater than 6').isLength({ min: 6 }),

    fetchUser,

    async (req, res) => {

        try {
            const result = validationResult(req);
            //if there are errors then we are simply rejecting the request
            if (!result.isEmpty()) {
                res.send({ errors: result.array() });
            } else {



                const { title, description, tag } = req.body;

                const note = new Note({
                    title,
                    description,
                    tag,
                    user_id: req.user.id
                });

                const savedNote = await note.save();

                res.json(savedNote);
            }

        }
        catch (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    });



//Route 3 for updating a particular note
router.patch("/updateNote/:id", fetchUser, async (req, res) => {
    try {
        //getting user from the request
        const user = req.user;

        //finding the note in request
        const note = await Note.findOne({ _id: req.params.id });

        //if note does not exist or if exist and it does not belong to user then returning
        //it is important to convert the object id to the string for comparison or use != if do not want to convert to string
        if (note === null || note.user_id.toString() !== user.id) {
            res.status(401).send("Not Allowed to do the following changes");
        }
        else {

            const newNote = {};
            const { title, description, tag } = req.body;

            if (title !== null) { newNote.title = title };
            if (description !== null) { newNote.description = description };
            if (tag !== null) { newNote.tag = tag };

            const updatedNote = await Note.findByIdAndUpdate(req.params.id,
                { $set: newNote }, { new: true });

            res.json(updatedNote);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});


//Route 4 for deleting a particular note
router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
    try {
        //getting user from the request
        const user = req.user;

        //finding the note in request
        const note = await Note.findOne({ _id: req.params.id });

        //if note does not exist or if exist and it does not belong to user then returning
        //it is important to convert the object id to the string for comparison or use != if do not want to convert to string
        if (note === null || note.user_id.toString() !== user.id) {
            res.status(401).send("Not Allowed to do the following changes");
        }
        else {

            await Note.findByIdAndDelete({ _id: req.params.id });

            res.json({ msg: "Successfully deleted note with _id:" + req.params.id });
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;