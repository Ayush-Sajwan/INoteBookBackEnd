const jwt=require('jsonwebtoken');
const JWT_SECRET = "I am the Strongest of them all";


//this middleware will read the jwt token and append the user details to the request
const fetchUser=(req,res,next)=>{

    //getting the token from the header
    const authtoken=req.header('auth-token');

    //if authtoken is not present then returning the error
    if(!authtoken){
        res.status(401).send({error:"Please verfiy using a valid token"});
    }

    else{

        try{

            //extracting the data from token
            //if any error occurs then it might be hampered
            const data=jwt.verify(authtoken,JWT_SECRET);
            req.user=data;
            next();

        }catch(err){
            console.log("Error occured while verifying the token");
            console.log(err);
            res.status(401).send({error:"Please verfiy using a valid token"});
        }
    }
}

module.exports=fetchUser;