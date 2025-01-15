const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const UPLOAD_FILE = "INSERT INTO uploaded_file (file) Values ($1)";
const DOWNLOAD_FILE = "SELECT * FROM uploaded_file where id = $1";

const uploadFile = (request, response) => {
    const { file } = request.body;

    try{
        pool.query(UPLOAD_FILE, [file], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

const downloadFile = (request, response) => {
    const id = parseInt(request.params.id);

    try{
        pool.query(DOWNLOAD_FILE, [id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

module.exports = {
    uploadFile,
    downloadFile,
}