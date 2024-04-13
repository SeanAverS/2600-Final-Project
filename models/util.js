(() => {

    // MongoDB connect 
    const MongoClient = require('mongodb').MongoClient;
    const connection = require("../server/config/config");

    // Connect MongoDB 
    const getMongoClient = async (local = false) => {
        let uri = `mongodb+srv://${connection.USERNAME}:${connection.PASSWORD}@${connection.SERVER}/${connection.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
        if (local) {
            uri = `mongodb://127.0.0.1:27017/${connection.DATABASE}`;
            console.log(`Connection String<<${uri}`);
        }

        console.log(`Connection String<<${uri}`)

        const client = new MongoClient(uri)
        // await client.connect()

        if (await client.connect()) {
            console.log("cool")
        }

        return new MongoClient(uri);
    }

    getMongoClient();
    
    const find = async (collection, query) => {
        return collection.find(query).toArray()
            .catch(err => {
                console.log("Could not find ", query, err.message);
            })
    }


    const insertOne = async (collection, document) => {
        return await collection.insertOne(document)
            .then(res => console.log("Data inserted with ID", res.insertedId))
            .catch(err => {
                console.log("Could not add data ", err.message);
                //For now, ingore duplicate entry errors, otherwise re-throw the error for the next catch
                if (!(err.name === 'BulkWriteError' && err.code === 11000)) throw err;
            })
    }

    const util = {
        url: getMongoClient,
        username: connection.USERNAME,
        password: connection.PASSWORD,
        port: 22643,
        database: connection.DATABASE,
        collections: ['userInfo'],
        getMongoClient: getMongoClient,
        // logRequest: logRequest,
        find: find,
        insertOne: insertOne,
        // insertMany: insertMany,
        getMongoClient: getMongoClient,
        // logRequest: logRequest,
    }
    const moduleExport = util
    if (typeof __dirname != 'undefined')
        module.exports = moduleExport

        
})()



