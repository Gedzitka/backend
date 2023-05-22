const cors = require('cors');
const API_PORT = 8000;
const mongoose = require('mongoose');
const Joi = require('joi');
const JoiDate = require('joi-date-extensions');
const express = require('express');
// const expressSession = require("express-session");
// const bcrypt = require("bcrypt");
const app = express();
app.use(cors());
app.use(express.json());
// app.use(expressSession({
//     secret: "a/#$sd#0$",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: process.env.NODE_ENV === "production",
//         httpOnly: true
//     }}))
app.listen(API_PORT, () => console.log("Listening on port " + API_PORT + "..."))
//DB connetction ----------------------------------------------------------------------------------------------------------------------------------------
mongoose
  .connect('mongodb://127.0.0.1:27017/assurancesdb2', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Could not connect to MongoDB... ', error));
// ------------------------------------------------------------------------------------------------------------------------------------------------------
// const clients = [
//   { "firstName": "Fratišek",
//     "lastName":"Skála",
//     "email":"f.s@gmail.com",
//     "phone": 777888899,
//     "streetNumber":"Růžová 1",
//     "city":"Praha 1",
//     "posteNumber":10000,
//     "assurance":"pojištení majetku",
//     "isAvailable": true }
//     { id: 2, firstName: "Zuzasna", lastName:"Holá", email:"z.h@gmail.com", phone: 775888899, streetNumber:"Modrá",city:"Praha 3",posteNumber:"13000" },
//     { id: 3, firstName: "Milan", lastName:"Řepa", email:"m.r@gmail.com", phone: 777868899, streetNumber:"Fialová",city:"Praha 6",posteNumber:"16000" },
//     { id: 4, firstName: "Eva", lastName:"Smutná", email:"e.s@gmail.com", phone: 777884899, streetNumber:"Růžová",city:"Praha 5",posteNumber:"15000" },
// ];

// const assurances = [
//          {
//             "type":"pojištení majetku ",
//          "price": 10000,
//          "subjectOfinsurance":"dům",
//          "validFrom": 1.1.2022,
//           "validTo:"1.1.2028
//         }
//     { id: 6, firstName: "Zuzana", lastName:"Holá", type:"pojištení majetku ", price: 10000,subjectOfinsurance:"dům",validFrom: "1.1.2022", validTo:"1.1.2028"},
//     { id: 7, firstName: "Milan", lastName:"Řepa", type:"pojištení majetku ", price: 10000,subjectOfinsurance:"dům",validFrom: "1.1.2022", validTo:"1.1.2028" },
//     { id: 8, firstName: "Eva", lastName:"Smutná", type:"pojištení majetku ", price: 10000,subjectOfinsurance:"dům",validFrom: "1.1.2022", validTo:"1.1.2028"  },
    
     
// ];
// Mongoose schemas ----------------------------------------------------------------------------------------------------------------------------------------


const clientSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    // age:Number,
    phone:Number,
    streetNumber:String,
    city:String,
    posteNumber:Number,
    // assuranceTypes: [String],
    // assuranceIDs: [mongoose.Schema.Types.ObjectId],
    // isAvailable: Boolean,
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
// const userSchema = new mongoose.Schema({
//     email: {type: String, index: {unique: true}},
//     passwordHash: String,
//     isAdmin: Boolean
// });

const Client = mongoose.model("Client", clientSchema);
const Assurance = mongoose.model("Assurance", assuranceSchema);
// const User = mongoose.model("User", userSchema);

//-----------------------------------------------------------------------------------------------------------------------------------
// const assurancesTypes = ["Pojištění majetku", "Pojištění nemovitosti", "Pojištění vozidla"];
// Validation functions---------------------------------------------------------------------------------------------------------------
function validateAssurance(assurance, required = true) {
    const schema = Joi.object({
        clientID:           Joi.string().min(3),
        type:               Joi.string().min(6),
        price:              Joi.number().min(6),
        subjectOfinsurance: Joi.string().min(3),
        validFrom:          Joi.date().format("DD.MM.YYYY").min("now").required,
        validTo:            Joi.date().format("DD.MM.YYYY").min("now").required,
       
    });

    return schema.validate(assurance,{ presence: (required) ? "required" : "optional" });
}
function validateClient(client,required=true) {
    const schema = Joi.object({
        firstName:    Joi.string().min(3),
        lastName:     Joi.string().min(3),
        email:        Joi.string().email({ tlds: { allow: false } }),
        // age:          Joi.number().min(2),
        phone:        Joi.number().min(9),
        streetNumber: Joi.string().min(3),
        city:         Joi.string().min(2),
        posteNumber:  Joi.number().min(5),
        // assuranceTypes: Joi.array(),
        // isAvailable:  Joi.bool(),
        // assuranceIDs:Joi.array()

    });
    return schema.validate(client, { presence: (required) ? "required" : "optional" });
   
}


function validateGet(getData) {
    const schema = Joi.object({
        firstName:    Joi.string().min(3),
        lastName:     Joi.string().min(3),
        email:        Joi.string().email({ tlds: { allow: false } }),
        // age:          Joi.number().min(2),
        phone:        Joi.number().min(9),
        streetNumber: Joi.string().min(3),
        city:         Joi.string().min(2),
        posteNumber:  Joi.number().min(5),
        // assuranceTypes: Joi.array(),
        // isAvailable:  Joi.bool(),
        // assuranceIDs:Joi.array()

    });
    return schema.validate(getData, { presence: "optional" });
    
}
// function validateUser(data) {
//     const schema = Joi.object({
//         email: Joi.string().email(),
//         password: Joi.string().min(6)
//     });

//     return schema.validate(data, {presence: "required"});
// }

// function validateLogin(data) {
//     const schema = Joi.object({
//         email: Joi.string(),
//         password: Joi.string()
//     });

//     return schema.validate(data, {presence: "required"});
// }
// ---------------------------------------------------------------------------------------------------------------------------------------------------
// Hash functions --------------------------------------------------------------
// function hashPassword(password, saltRounds = 10) {
//     return bcrypt.hashSync(password, saltRounds);
// }

// function verifyPassword(passwordHash, password) {
//     return bcrypt.compareSync(password, passwordHash);
// }

// -----------------------------------------------------------------------------

// session functions -----------------------------------------------------------
// function getPublicSessionData(sessionData) {
//     const allowedKeys = ["_id", "email", "isAdmin"];
//     const entries = allowedKeys
//         .map(key => [key, sessionData[key]]);
//     return Object.fromEntries(entries);
// }

// -----------------------------------------------------------------------------

// route handlers --------------------------------------------------------------
// const requireAuthHandler = (req, res, next) => {
//     const user = req.session.user;
//     if (!user) {
//         res.status(401).send("Nejprve se přihlaste");
//         return;
//     }
//     User.findById(user._id)
//         .then((user) => {
//             if (user === null) {
//                 req.session.destroy((err) => {
//                     if (err) {
//                         res.status(500).send("Nastala chyba při autentizaci");
//                         return;
//                     }
//                     res.status(401).send("Nejprve se přihlaste");
//                 });
//                 return;
//             }
//             next();
//         })
//         .catch(() => {
//             res.status(500).send("Nastala chyba při autentizaci");
//         });
// }
// const requireAdminHandlers = [
//     requireAuthHandler,
//     (req, res, next) => {
//         const user = req.session.user;
//         if (!user.isAdmin) {
//             res.status(403).send("Nemáte dostatečná práva");
//             return;
//         }
//         next();
//     }
// ];
// -----------------------------------------------------------------------------


// GET requests -------------------------------------------------------------------------------------------------------------------------------------

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


// ---------------------------------------------------------------------------------------------------------------------------

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

// app.post("/api/user", (req, res) => {
//     const userData = req.body;
//     const {error} = validateUser(userData);
//     if (error) {
//         res.status(400).send(error.details[0].message);
//         return;
//     }

//     const userCreateData = {
//         email: userData.email,
//         passwordHash: hashPassword(userData.password),
//         isAdmin: false
//     };

//     User.create(userCreateData)
//         .then(savedUser => {
//             const result = savedUser.toObject();
//             delete result.passwordHash;
//             res.send(result);
//         })
//         .catch(e => {
//             if (e.code === 11000) { // pokud email v databázi již existuje
//                 res.status(400).send("Účet se zadaným emailem již existuje");
//                 return;
//             }
//             res.status(500).send("Nastala chyba při registraci");
//         });
// });
// app.post("/api/auth", (req, res) => {
//     const loginData = req.body;
//     const {error} = validateLogin(req.body);
//     if (error) {
//         res.status(400).send(error.details[0].message);
//         return;
//     }
//     User.findOne({email: loginData.email})
//         .then(user => {
//             if (!user || !verifyPassword(user.passwordHash, loginData.password)) {
//                 res.status(400).send("Email nebo heslo nenalezeno");
//                 return;
//             }
//             const sessionUser = user.toObject();
//             delete sessionUser.passwordHash;
//             req.session.user = sessionUser;
//             req.session.save((err) => {
//                 if (err) {
//                     res.status(500).send("Nastala chyba při přihlašování");
//                     return;
//                 }
//                 res.send(getPublicSessionData(sessionUser));
//             });
//         })
//         .catch(() => res.status(500).send("Nastala chyba při hledání uživatele"));
// });
// ------------------------------------------------------------------------------------------------------------------------------




// PUT requests ----------------------------------------------------------------
// router.put('/:id', async (req, res) => {
//     try {
//       await ListItem.findByIdAndUpdate(req.params.id, {
//           itemname: req.body.itemname,
//           category: req.body.category
//       });
//       // Send response in here
//       res.send('Item Updated!');

//     } catch(err) {
//         console.error(err.message);
//         res.send(400).send('Server Error');
//     }
// });
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

// DELETE requests npm-------------------------------------------------------------------------------------------------------------
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

// app.delete("/api/auth", (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             res.status(500).send("Nastala chyba při mazání session");
//             return;
//         }
//         res.send("Uživatel odhlášen");
//     });
// });
// app.put('/api/clients/:id', (req, res) => {
// 	const id = Number(req.params.id);
// 	const client = client.find(client => client.id === id);
// 	if (!client) {
// 		res.status(404).send('Klient nebyl nalezen.');
// 		return;
// 	}
// 	const { error } = validateClient(req.body);
// 	if (error) {
    
// 		res.status(400).send(error.details[0].message);
// 	} else {
//         client.firstName= req.body.firstName;
//         client.lastName= req.body.lastName;
//         client.email= req.body.email;
//         client.phone= req.body. phone;
//         client.streetNumber= req.body.streetNumber;
//         client.city= req.body.city;
//         client.posteNumber= req.body.posteNumber;
// 		res.send(client);
// 	}
// });


