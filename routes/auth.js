const express = require('express');
const User = require('../schemas/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');


const JWT_SECRET = "I am the Strongest of them all";

const router = express.Router();


//Route 1 for registering the user
router.post("/createUser",

    //checking whether the request data is valid or not using express validator
    body('name', 'Name length should be greater than 4').isLength({ min: 4 }),
    body('email', 'Invalid email address').notEmpty().isEmail(),
    body('password', 'Password length should be greater than 6').isLength({ min: 6 }),
    //creating our own custom validator we can throw an error we want to reject
    body('email').custom(async (email) => {

        //checking if this email is already registered or not
        //if yes then throwing the error
        const user = await User.findOne({ email: email });
        if (user !== null) {
            throw new Error("Email is already registered");
        }

    }),
    async (req, res) => {

        //getting the result of our validation
        //it returns an array of errors
        //if there are no errors then it is empty
        const result = validationResult(req);

        //if there are errors then we are simply rejecting the request
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.array() });
        }

        //if there are no errors then we are registering the user
        else {

            //getting user data
            const { name, email, password } = req.body;

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);

            const hashedPassword = await bcrypt.hash(password, salt);


            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            })

            user.save()
                .then(() => {


                    //making a jwt token

                    //this is the data that we want to store in the token
                    //it can be anything
                    const data = {
                        id: user.id
                    }

                    const authToken = jwt.sign(data, JWT_SECRET);
                    res.json({authToken});
                })
                .catch((err) => {
                    console.log(err);
                    res.send("Could not register the user at the moment");
                })

        }

    });


//Route 2 to login the user
router.post("/login",

    //checking if the request is valid or not
    body('email', 'Invalid email address').notEmpty().isEmail(),
    body('password', 'Password length should be greater than 6').isLength({ min: 6 }),


    async (req, res) => {

        const result = validationResult(req);

        //if there are errors then we are simply rejecting the request
        if (!result.isEmpty()) {
            res.send({ errors: result.array() });
        }
        else {

            //destructuring the request 
            const { email, password } = req.body;

            const user = await User.findOne({ email: email });

            if (!user) {
                
                res.status(400).send("Please check your email and password");
            }
            else {



                //comparing the hashed string in the database with the password entered
                const match = await bcrypt.compare(password, user.password);

                //if password doesnot match then returning 
                if (!match) {
                    res.status(400).send("Please check your email and password");
                }
                else {



                    //returning a jwt token if password match
                    const data = {
                        id: user.id,
                        email: user.email
                    }

                    const authToken = jwt.sign(data, JWT_SECRET);
                    res.json({authToken});

                }

            }
        }

    });

//Route 3 for getting user details from the jwt token
router.post("/getUser", fetchUser, (req, res) => {

    try {

        //accessing the user object from request appended by the fetch middleware
        const user = req.user;
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;