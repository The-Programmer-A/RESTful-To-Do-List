const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
const express = require("express");
const app = express();
const path = require("path");
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname)))
  .use(bodyParser.json())
  .get("/", (req, res) => res.render("index")) //this should run my todo list application from assignment 1
  .get("/items", async (req, res) => {
    // get all items in todo list
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM todo");
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      //console.log(results); //see what im getting
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post("/items", async function(req, res) {
    var newTask = req.body.task;
    var newName = req.body.name;
    try {
      const client = await pool.connect();
      //res.send("You are in the API call" + req.body.task + " " + req.body.name);  
      const result = await client.query(`INSERT INTO todo(item, username, status) VALUES('${newTask}','${newName}','incomplete') returning *`);
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      if(results === null){
        res.sendStatus(404);
        //res.status(200).send();
      }
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .delete("/deleteItems", async function(req, res) {
    var deleteTask = req.body.task;
    var deleteUsername = req.body.name;
    try {
      const client = await pool.connect(); 
      const result = await client.query(`DELETE FROM todo WHERE item = '${deleteTask}' AND username = '${deleteUsername}' returning *`);
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .put("/updateItems", async function(req, res) {
    var oldT = req.body.oldTask;
    var oldN = req.body.oldName;
    var newT = req.body.newTask;
    var newN = req.body.newName;
    try {
      const client = await pool.connect(); 
      const result = await client.query(`UPDATE todo SET item = '${newT}', username = '${newN}' WHERE item = '${oldT}' AND username = '${oldN}' returning *`);
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .patch("/updateStatus", async function(req, res) {
    var doneTask = req.body.task;
    var doneUser = req.body.name;
    var changeStatus = req.body.status;    
    console.log("doneTask = " + doneTask);
    console.log("doneUser = " + doneUser);
    console.log("changeStatus = " + changeStatus);
    try {
      const client = await pool.connect(); 
      const result = await client.query(`UPDATE todo SET status = '${changeStatus}' WHERE item = '${doneTask}' AND username = '${doneUser}' returning *`);
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get("/itemsCompleted", async function(req, res) {
   try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM todo WHERE status = 'Completed'");
      const results = { results: result ? result.rows : null }; //else { return res.send('No Data Found')}
      //console.log(results); //see what im getting
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
