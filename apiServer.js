const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://harshgosai:harsh@database.sxgme.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   
  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})

 
app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n"); 

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
			console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n"); 

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});

app.post('/registerUser', (req, res) => {
    console.log("POST request received for user registration: " + JSON.stringify(req.body) + "\n");

    const newUser = req.body;

    // Insert the new user data into the 'users' collection
    userCollection.insertOne(newUser, (err, result) => {
        if (err) {
            console.log("Error inserting user: " + err + "\n");
            res.status(500).send({ success: false, message: "Failed to register user." });
        } else {
            console.log("User registered with ID: " + result.insertedId + "\n");
            res.status(200).send({ success: true, message: "User registered successfully!" });
        }
    });
});



app.post('/verifyUser', (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	loginData = req.body;

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});

app.post('/getUserOrders', (req, res) => {
    console.log("POST request received for fetching user orders: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email;

    // Find orders in the 'orders' collection that match the email of the currently logged-in user
    orderCollection.find({ customerEmail: userEmail }).toArray((err, orders) => {
        if (err) {
            console.log("Error retrieving orders: " + err + "\n");
            res.status(500).send({ success: false, message: "Failed to retrieve orders." });
        } else {
            console.log("Orders retrieved for user: " + userEmail + " - " + JSON.stringify(orders) + "\n");
            res.status(200).send({ success: true, orders: orders });
        }
    });
});

app.post('/getOrdersForDeletion', (req, res) => {
    console.log("POST request received for fetching user orders for deletion: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email;

    // Find orders in the 'orders' collection that match the email of the currently logged-in user
    orderCollection.find({ customerEmail: userEmail }).toArray((err, orders) => {
        if (err) {
            console.log("Error retrieving orders: " + err + "\n");
            res.status(500).send({ success: false, message: "Failed to retrieve orders." });
        } else {
            console.log("Orders retrieved for user: " + userEmail + " - " + JSON.stringify(orders) + "\n");
            res.status(200).send({ success: true, orders: orders });
        }
    });
});

app.delete('/deleteOrders', (req, res) => {
    console.log("DELETE request received to delete orders: " + JSON.stringify(req.body) + "\n");

    const orderIds = req.body.orderIds; // Array of order IDs to be deleted

    // Convert string IDs to MongoDB ObjectId format
    const objectIds = orderIds.map(id => new require('mongodb').ObjectId(id));

    // Delete the selected orders
    orderCollection.deleteMany({ _id: { $in: objectIds } }, (err, result) => {
        if (err) {
            console.log("Error deleting orders: " + err + "\n");
            res.status(500).send({ success: false, message: "Failed to delete orders." });
        } else {
            console.log("Orders deleted: " + result.deletedCount + "\n");
            res.status(200).send({ success: true, deletedCount: result.deletedCount });
        }
    });
});


app.post('/postOrderData', function (req, res) {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
    
    orderCollection.insertOne(req.body, function(err, result) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		}else {
			console.log("Order record with ID "+ result.insertedId + " have been inserted\n"); 
			res.status(200).send(result);
		}
		
	});
       
});

  
app.listen(port, () => {
  console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
