// Middleware to ensure only users with role "student" can access certain routes

const checkStudent = (req,res,next) =>{
    console.log("User from token:", req.user); // ✅ Add this
    if(req.user && req.user.role === "student"){ //req.user	 ==> Already set by JWT middleware (protect)
        next();
    }
    else{
        // ❌ Not a student (maybe instructor or admin)
        res.status(403).json({ message: "Access denied. Students only." });
    }
};
module.exports= checkStudent;