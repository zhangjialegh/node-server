const mysql = require('mysql')
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'jiale',
  database: 'mysql_db'
})

pool.getConnection((err,connection)=>{
  connection.query(`SELECT * FROM my_table`,(error,res,fields)=>{
    connection.release()

    if(error) throw error;
    console.log(res,fields,'res')
  })
})
