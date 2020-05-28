const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const app = express();

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://dynamodb.us-east-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//GET TODAY'S DATE
let today = new Date();
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let dd = String(today.getDate()).padStart(2, '0');
let day = today.getDay();
let yyyy = today.getFullYear();
let weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

dayOfWeek = `${weekday[day]}`;
today = `${mm} / ${dd} / ${yyyy}`;
console.log(today);



//ROUTES 

app.get("/", (req, res) => {
    res.redirect("/you-got-this");
});

app.get("/you-got-this", (req, res) => {
    var params = {
        TableName : "MotivationalQuotes",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames:{
            "#id": "quote_id"
        },
        ExpressionAttributeValues: {
            ":id": "392561c2-0058-4ccd-80d3-511932f50f36"
        }
    };
    docClient.query(params, (err, data) => {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log(`Query succeeded.`);
            res.render("index", {data: data, today: today, dayOfWeek: dayOfWeek})
        }
    });
});


// CREATE ROUTE

app.post("/", (req, res) => {
    var table = "MotivationalQuotes"
    var postQuoteID = uuidv4();
    var postQuote = req.body.quote.quote;
    var postAuthor = req.body.quote.author;
    
    var params = {
        TableName:table,
        Item:{
            "quote_id": postQuoteID,
            "quote": postQuote,
            "author": postAuthor
        }
    };
    
    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log(`Added quote_id: ${postQuoteID}`);
            res.redirect("/you-got-this");
        }
    });
})

app.listen(port, () => {
    console.log(`Fortune App started on Port ${port}`);
});

