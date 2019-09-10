const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000



express()
  .use(express.static(path.join(__dirname)))
  // .set('views', path.join(__dirname, 'views'))
  // .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index')) //this should run my todo list application from assignment 1
  .get('/db', async (req, res) => { // get all items in todo list
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM todo');
      const results = { 'results': (result) ? result.rows : null}; //else { return res.send('No Data Found')}
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  // Implement appropriate database calls for each API function of your RESTful web service.
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
