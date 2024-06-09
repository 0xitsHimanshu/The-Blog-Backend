
export const test = async(req, res) =>{
    try{
        res.send("Test route is working");
    } catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}