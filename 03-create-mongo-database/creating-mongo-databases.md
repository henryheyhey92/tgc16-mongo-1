# Creating a new Mongo database

You just `use` the database as if it exists. To create, for example, a database
named `animal_shelter`, we just do:

```
use animal_shelter
```

The database is not permanent until it has a collection

# Create a collection
To create a collection, you simply add a document to the collection. Assume it exists
and add a document to it.

# Add a document to a collection
It works even if the collection does not exist. Assuming that we want to add to
the `animals` collection:

```
db.animals.insertOne({
    'name':'Fluffy',
    'age':3,
    'breed':'Golden Retriever',
    'type':'Dog'
})
```
## Add many documents at a time to a collection
```
db.animals.insertMany([
    {
        'name':'Dazzy',
        'age':5,
        'breed':'Greyhound',
        'type':'Dog'
    },
    {
        'name':'Timmy',
        'age':1,
        'breed':'Border Collie',
        'type':'Dog'
    }
])
```

# Update existing documents in a database
Two methods:
* replace with an entirely new document
* replace only some of the properties of the document

## Replace with new document
Assuming Timmy's ObjectID is `62172cfc5e4cc3d0ca8b8409`

```
db.animals.updateOne({
    '_id':ObjectId('62172cfc5e4cc3d0ca8b8409')
},{
    $set:{
        'name':'Timmy',
        'breed':'German Shepherd',
        'age':1.5,
        'type':'Dog'
    }
})
```

## Update only one field in the document
We want to change the name of Timmy to Thunder:
```
db.animals.updateOne({
    '_id':ObjectId('62172cfc5e4cc3d0ca8b8409')
},{
    $set:{
        'name':'Thunder'
    }
})
```

## Delete an animal
```
db.animals.deleteOne({
    '_id':ObjectId('62172cfc5e4cc3d0ca8b8409')
});
```
# How to work with embedded documents
Keep track of checkups that each animal had:
```
db.animals.insertOne({
    'name':'Cookie',
    'age':3,
    'breed':'Lab Retriver',
    'type':'Dog',
    'checkups':[]
})

db.animals.insertOne({
    'name':'Frenzy',
    'age':1,
    'breed':'Wild cat',
    'type':'Cat',
    'checkups':[
        {
            'id':ObjectId(),
            'name':'Dr Chua',
            'diagnosis':'Heartworms',
            'treatment':'Steriods'
        }
    ]
});
```

## Add a new sub-document to an array
```
db.animals.updateOne({
    '_id':ObjectId('62173de1c77fb2cf36a41a38')
},{
    '$push':{
        'checkups':{
            'id':ObjectId(),
            'name':'Dr Tan',
            'diagnosis':'Diabetes',
            'treatment':'Medication'
        }
    }
})
```

We can use $push on documents that don't have the array to begin with

```
db.animals.updateOne({
    '_id':ObjectId("62172c5d5e4cc3d0ca8b8407")
},{
    $push:{
        'checkups':{
            'id':ObjectId(),
            'name':'Dr Chua',
            'diagnosis':'Flu',
            'treatment':'Pills'
        }
    }
})
```
## Remove sub-document from array
Remove the checkup from Fluffy the golden retriever with the id of 

```
db.animals.updateOne({
    "_id":ObjectId("62172c5d5e4cc3d0ca8b8407"),
},{
    '$pull':{
        'checkups':{
            'id':ObjectId("62173fe1c77fb2cf36a41a3c")
        }
    }
})
```

## Update one of the checkups' name to Dr. Su 
```
db.animals.updateOne({
    '_id':ObjectId("62173df8c77fb2cf36a41a3a"),
    'checkups':{
        $elemMatch:{
            'id':ObjectId("62173df8c77fb2cf36a41a39")
        }
    }
},{
    '$set': {
        'checkups.$.name':'Dr Su'
    }
})
```
Alternate method:

```
db.animals.updateOne({
    '_id':ObjectId('62173df8c77fb2cf36a41a3a'),
    'checkups.id':ObjectId("62173df8c77fb2cf36a41a39")
}, {
    $set:{
        'checkups.$.name':'Dr Zhao'
    }
})
```

## Update the fields of all sub documents that matches a critera

```
db.animals.updateOne(
    {
        '_id':ObjectId("62172c5d5e4cc3d0ca8b8407")
    },
    {
        $set:{
            'checkups.$[eachCheckup].diagnosis':'redacted'
        }
    },
    {
        arrayFilters:[
            {
                'eachCheckup.name':'Dr Chua'
            }
        ]
    }
)
```

Update all Dr. Chua's checkups so that its diagnosis is 'redacted'

db.animals.updateMany(
    {
       
    },
    {
        $set:{
            'checkups.$[eachCheckup].diagnosis':'redacted'
        }
    },
    {
        arrayFilters:[
            {
                'eachCheckup.name':'Dr Chua'
            }
        ]
    }
)