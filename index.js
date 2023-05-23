//databáze spuštění node index.js v příkazovém řádku
const cors = require('cors');
const API_PORT = 8000;
const mongoose = require('mongoose');
const Joi = require('joi');
const JoiDate = require('joi-date-extensions');
const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

app.listen(API_PORT, () => console.log("Listening on port " + API_PORT + "..."))
//DB connetction --------------------------------------------------------------------------------------------------------------------
mongoose
  .connect('mongodb://127.0.0.1:27017/assurancesdb2', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Could not connect to MongoDB... ', error));
// --------------------------------------------------------------------------------------------------------------------
// Mongoose schemas --------------------------------------------------------------------------------------------------------------------


const clientSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phone:Number,
    streetNumber:String,
    city:String,
    posteNumber:Number,
   
    dateAdded: {
      type: Date,
      default: Date.now
    }
});
const assuranceSchema = new mongoose.Schema({
    clientID: String,
    type: String,
    price: Number,
    subjectOfinsurance: String,
    validFrom: Date,
    validTo: Date
});

const Client = mongoose.model("Client", clientSchema);
const Assurance = mongoose.model("Assurance", assuranceSchema);


//-------------------------------------------------------------------------------------------------------------------

// Validation functions-----------------------------------------------------------------------------------------------------------
function validateAssurance(assurance, required = true) {
    const schema = Joi.object({
        clientID:           Joi.string().min(3),
        type:               Joi.string().min(6),
        price:              Joi.number().min(6),
        subjectOfinsurance: Joi.string().min(3),
        validFrom:          Joi.date().iso().strict().format("YYYY-MM-DD"),
        validTo:            Joi.date().iso().strict().format("YYYY-MM-DD"),
       
    });

    return schema.validate(assurance,{ presence: (required) ? "required" : "optional" });
}
function validateClient(client,required=true) {
    const schema = Joi.object({
        firstName:    Joi.string().min(3),
        lastName:     Joi.string().min(3),
        phone:        Joi.number().min(9),
        streetNumber: Joi.string().min(3),
        city:         Joi.string().min(2),
        posteNumber:  Joi.number().min(5),
    

    });
    return schema.validate(client, { presence: (required) ? "required" : "optional" });
   
}


function validateGet(getData) {
    const schema = Joi.object({
        firstName:    Joi.string().min(3),
        lastName:     Joi.string().min(3),
        email:        Joi.string().email({ tlds: { allow: false } }),
        phone:        Joi.number().min(9),
        streetNumber: Joi.string().min(3),
        city:         Joi.string().min(2),
        posteNumber:  Joi.number().min(5),

    });
    return schema.validate(getData, { presence: "optional" });
    
}

// --------------------------------------------------------------------------------------------------------------------


// GET requests --------------------------------------------------------------------------------------------------------------------

  app.get('/api/clients', (req, res) => {
    const { error } = validateGet(req.query);
    if (error)
    {
        res.status(404).send(error.details[0].message);
        return;
    }

    let dbQuery = Client.find();
    if (req.query.assuranceID)
        dbQuery = dbQuery.where("assuranceIDs", req.query.assuranceID);

    if (req.query. assuranceTypes)
        dbQuery = dbQuery.where(" assuranceTypes",req.query.type);

    if (req.query.firstName)
        dbQuery = dbQuery.where("firstName",req.query.firstName);
    
    if (req.query.lastName)
        dbQuery = dbQuery.where("lastName",req.query.lastName);
    
    if (req.query.limit)
        dbQuery = dbQuery.limit(parseInt(req.query.limit));

    dbQuery
        .then(client => { res.json(client) })
        .catch(err => { res.status(400).send("Požadavek na klienta selhal!"); });
});
async function getClientByID(id) {
    let client = await Client.findById(id);
    if (client) {
        client = client.toJSON();
        let assurances = await Assurance.find().where("_id").in(client.assuranceIDs).select("_id name");
        client.assurances = JSON.parse(JSON.stringify(assurances));
    }
    return client;
}

app.get('/api/clients/:id', (req, res) => {
    getClientByID(req.params.id)
        .then(client => {
            if (client)
                res.send(client);
            else
                res.status(404).send("Client s daným id nebyl nalezen!");
        })
        .catch(err => {
            res.status(400).send("Chyba požadavku GET na klienta!")
        });
});
app.get('/api/assurances', (req, res) => {
    const {error} = validateGet(req.query);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    let dbQuery = Assurance.find().where("type");

    if (req.query.limit)
        dbQuery = dbQuery.limit(parseInt(req.query.limit));

    dbQuery.then(assurances => {
        res.json(assurances);
    })
        .catch(err => {
            res.status(400).send("Chyba požadavku na pojištění!");
        });
});
app.get('/api/assurances/:id', (req, res) => {
    Assurance.findById(req.params.id, (err, assurance) => {
        if (err)
            res.status(404).send("Pojištění s daným ID nebylo nalezeno.");
        else
            res.json(assurance);
    });
});


// --------------------------------------------------------------------------------------------------------------------

// POST requests -------------------------------------------------------------------------------------------------------------

app.post('/api/clients', (req, res) => {
    const { error } = validateClient(req.body);
	if (error) {
		res.status(400).send(error.details[0].message);
	} else {
        Client.create(req.body)
          .then(result => { res.json(result) })
          .catch(err => { res.send("Nepodařilo se uložit klienta!") });
        }
    
   
});
app.post('/api/assurances', (req, res) => {
    const { error } = validateAssurance(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Assurance.create(req.body)
            .then(result => { res.json(result) })
            .catch(err => { res.send("Nepodařilo se uložit pojištění!") });
    }
});


// --------------------------------------------------------------------------------------------------------------------

// PUT requests 
// -------------------------------------------------------------------------------------------------------------------

app.put('/api/clients/:id', (req, res) => {
    const {error} = validateClient(req.body, false);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Client.findByIdAndUpdate(req.params.id, req.body,)
            .then(result =>{res.json(result)})
            
            .catch(err => {res.send("Nepodařilo se uložit klienta!")
            });

    }
});

app.put('/api/assurances/:id', (req, res, ) => {
    const {error} = validateAssurance(req.body, false);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Assurance.findByIdAndUpdate(req.params.id, req.body)
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                res.send("Nepodařilo se uložit pojištění!")
            });
    }
});
//-------------------------------------------------------------------------------------------------------------

// DELETE requests -------------------------------------------------------------------------------------------------------------
app.delete('/api/clients/:id', (req, res) => {
    Client.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result)
                res.json(result);
            else
                res.status(404).send("Klient s daným id nebyl nalezen!");
        })
        .catch(err => { res.send("Chyba při mazání klienta!") });
});
app.delete('/api/assurances/:id', (req, res) => {
    Assurance.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result)
    
                res.json(result);
               
            else
            
                
                res.status(404).send("Pojištění s daným id nebylo nalezeno!");
            })
        .catch(err => { res.status(400).send("Nepodařilo se smazat pojištění!") });
});

