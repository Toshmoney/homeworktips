const express = require("express");
const app = express();
const cors = require("cors")
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const router = require("./routes/handler");
// const chatRouter = require("./routes/messageRoutes");
const modeRatorRouter = require("./routes/moderator")
const adminRouter = require("./routes/admin")
const connectDB = require("./db/connect");
require("dotenv").config()
const port = 1000;
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

app.use(express.json());
app.use(fileUpload());
app.use(cors({origin:"*"}))
app.use(bodyParser.urlencoded({extended:true}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/", router)
// app.use("/chats", chatRouter)
app.use("/moderator", modeRatorRouter)
app.use("/admin", adminRouter)

// app.all("*", (req, res)=>{
//     res.status(404).json({error:"The endpoint you are looking for does not exists!"})
// })

app.listen(port, async()=>{
    console.log(`Server runnin on port ${port}`);
    await connectDB("DB connected successfully!!!")
})