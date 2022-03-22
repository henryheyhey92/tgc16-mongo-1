const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId
const MongoUtil = require('./MongoUtil');

const COLLECTION_NAME="food_sightings";

//Three parts of the an express application

//Setup
const app = express();

//enable JSON data processing (this is to convert request and response to json )
app.use(express.json());

//enable CORS
app.use(cors());

//Routes
async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_food_sightings")

    app.get('/welcome', function (req, res) {
        res.json({
            'message': 'Welcome to the free foood sighting api!'
        })
    })

    //To design an API endpoint
    //1. what's the url (RESTFUL)
    //2. deteremine verb:
    // get : retrieve info
    //post : add new info
    //delete: delete existing info
    // patch: modify a bit of an existing info
    // put: replace existing info
    //3 . design the body
    // what information does the user have to pass you?
    app.post('/free_food_sighting', async function (req, res) {

        try {
            // to create a free food sighting:
            // - description
            // - comma separated string of the food
            // - datetime
            let description = req.body.description;
            let food = req.body.food.split(',');
            let datetime = new Date(req.body.datetime);

            //insert into mongo database
            // when the key and the variable name is the same
            // we can just use the veriable name
            const db = MongoUtil.getDB();

            await db.collection('food_sightings').insertOne({
                description,
                food,
                datetime
            });
            res.status(200);
            res.json({
                'message': 'The record has been added succuessfully'
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e);
        }
    })

    app.get('/free_food_sighting', async function(req, res){
        //create citeria object (assumption: the user wants everything)

        // create citeria object (assumption: the user wants everything)
        let criteria = {};

        if (req.query.description) {
            criteria['description'] = {
                '$regex': req.query.description,
                '$options':'i'
            }
        }

        if (req.query.food) {
            criteria['food'] = {
                '$in': [req.query.food]
            }
        }

        const db = MongoUtil.getDB();
        let foodSightings = await db.collection('food_sightings').find(criteria).toArray();
        res.json({
            'food_sightings': foodSightings
        })
    })

    app.put('/free_food_sighting/:id', async function(req, res){
        let {description, food, datetime} = req.body;
     
        food = food.split(',');

        // remove all whitespaces from the front and back
        food = food.map(function(each_food_item){
            return each_food_item.trim();
        })
        datetime = new Date(datetime);
        let results = await MongoUtil.getDB().collection('food_sightings').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$set':{
                'description': description,
                'food':food,
                'datetime':datetime
            }
        })
        res.status(200);
        res.json({
            'message':'Food sighting has been updated'
        })
    })

    app.delete('/free_food_sighting/:id', async function (req,res){
        await MongoUtil.getDB().collection(COLLECTION_NAME).deleteOne({
            '_id':ObjectId(req.params.id)
        })
        res.status(200);
        res.json({
            'message':'The document has been deleted'
        })
    })

}

main();


app.listen(3000, function () {
    console.log("Server has started")
})

//Listen