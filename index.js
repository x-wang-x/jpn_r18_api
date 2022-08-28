const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const r18 = require("./r18.js");
const jdb = require("./javdb.js");
const jlnd = require("./javland.js");
const jlib = require("./javlib")
const { json } = require('express');

app.get('/', (req, res) => {
    res.send('Hello World!')
  });
app.get('/get/r18/:key', async (req, res) => {
    console.log("Searching : "+req.params.key)
    let data = await r18.get(req.params.key);
    res.send(data);
    console.log(data);
  });
app.get('/get/javland/:key', async (req, res) => {
    console.log("Searching : "+req.params.key)
    let data = await jlnd.search(req.params.key);
    data = JSON.parse(data)
    // console.log(data)
    if(data.status=='ok'){
      res.json(data)
      console.log(data);
    }
    else{
      res.json({status : "error"})
      console.log('Not found');
    }
  });
app.get('/get/javlib/:key', async (req, res) => {
    console.log("Searching : "+req.params.key)
    let data = await jlib.search(req.params.key);
    data = JSON.parse(data)
    // console.log(data)
    if(data.status=='ok'){
      res.json(data)
      console.log(data);
    }
    else{
      res.json({status : "error"})
      console.log('Not found');
    }
  });
app.get('/get/:key', async (req, res) => {
    console.log("GET : "+req.params.key)
    let data = await r18.get(req.params.key);
    res.send(data);
    console.log(data);
  });
app.get('/get/javdb/:key', async (req, res) => {
    console.log("GET : "+req.params.key)
    let lis = await jdb.get(req.params.key);
    res.json(lis);
    console.log(lis);
  });
app.get('/get-cover/:key', async (req, res) => {
    console.log("GET : "+req.params.key)
    let data = await r18.get(req.params.key);
    if (data!=null){
        data = await data.data.images.jacket_image;
        res.send(data);
    }
    else{
        data = {status : "Error"}
        res.send(data)
    }
    
    // console.log(data);
  });
app.listen(port, () => {
    console.log(`webserver listening at http://localhost:${port}`)
  });