const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/posts')
const port = process.env.PORT || 5000;

dotenv.config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(() => console.log("connected to mongodb"));

// middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'));

app.use('/corner_app/users', userRouter)
app.use('/corner_app/auth', authRouter)
app.use('/corner_app/posts', postRouter)



app.listen(port, () => {
  console.log("Server is running");
});
