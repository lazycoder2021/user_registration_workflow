const express = require('express'); 
const app = express(); 
const mongoose = require('mongoose'); 
require('dotenv').config({});
const User = require('./model/User'); 
const sendMail = require('./sendMail'); 

app.use(express.json()); 

mongoose.connect('mongodb://localhost:27017/userAuth'); 
mongoose.connection.on('open', function () {
    console.log('db connected...')
})

app.post('/register', async function (req, res) {
    try {
        var uid = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        var charactersLength = characters.length;

        for (var i = 0; i < 6; i++) {
            uid += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        const user = await new User({ ...req.body, uid: uid }); 
        await user.save()

        const options = {
            name: user.name, 
            email: user.email, 
            uid: user.uid, 
            subject: 'Vikalp Account Verification'
        }

        sendMail(options)

        res.status(200).send(user)
    } catch (e) {
        console.log(e)
    }
})

app.post('/verifycode', async function (req, res) {
    try {
        const user = await User.findOne({ uid: req.body.code }); 
        if (user) {
            console.log(user._id.toString())
            user.verify = true; 
            await user.save(); 
            res.send('correct code')
        } else {
            res.send('wrong code')
        }
    } catch (e) {
        console.log(e)
    }
})

app.listen(process.env.PORT, function () {
    console.log(`server up and running @ ${process.env.PORT}`)
})