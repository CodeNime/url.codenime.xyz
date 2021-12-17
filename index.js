const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const Swal = require("sweetalert2");
const Collect = require("@supercharge/collections");
const db = require("quick.db");
require('dotenv').config()

app.use(bodyParser());
app.set("json spaces", 2);
app.use(express.static("public"));
app.set("view engine", "ejs");

function hasWhiteSpace(s) {
  return /\s/.test(s);
}

var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
var checkForSpecialChar = function (string) {
  for (i = 0; i < specialChars.length; i++) {
    if (string.indexOf(specialChars[i]) > -1) {
      return true;
    }
  }
  return false;
};

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

let counting = db.fetch(`shorted`);

setInterval(function () {
  counting = db.fetch(`shorted`);
}, 5000);

/* ----- MONGODB ----- */
var monk = require("monk");

const thedb = monk(process.env.MONGODB);

thedb
  .then(() => {
    console.log("[ MONGODB ] Connected to mongo server.");
  })
  .catch((e) => {
    console.log("[ MONGODB ] Failed to connect to server.");
  });

const inidb = thedb.get("codenime-short");
/* ----- END MONGODB ----- */

app.get("/", async (req, res) => {
  res.render("index", {
    notavailable: false,
    aliasnull: false,
    deleted: false,
  });
});

app.get("/test", async (req, res) => {
  res.render("test", { isAdded: true, long: "test", alias: "testing", id: makeid(8) });
});

app.get("/delete", async (req, res) => {
  res.render("remove", { aliasnull: false });
});

app.get("/:short", async (req, res) => {
  const queryshort = req.params.short;

  const final = inidb.findOne({ shorted: req.params.short }).then((docs) => {
    if (docs == null) res.status(404).send("404");
    else res.redirect(docs.url);
  });
});

app.post("/short", async (req, res) => {
  var urlnya = req.body.url;
  var shortnya = req.body.short;

  const inisudahada = await inidb.findOne({ shorted: shortnya });

  var iddelete = makeid(8)

  if (inisudahada) {
    res.render("index", {
      notavailable: true,
      aliasnull: false,
      deleted: false,
    });
  } else if (hasWhiteSpace(shortnya) === true) {
    res.render("index", {
      notavailable: true,
      aliasnull: false,
      deleted: false,
    });
  } else if (checkForSpecialChar(shortnya) === true) {
    res.render("index", {
      notavailable: true,
      aliasnull: false,
      deleted: false,
    });
  } else {
    const pushtodb = {
      url: urlnya,
      shorted: shortnya,
      id: iddelete
    };

    inidb.insert(pushtodb),
      res.render("test", { isAdded: true, long: urlnya, alias: shortnya, id: iddelete }),
      db.add("shorted", 1);
  }
});

app.post("/remove", async (req, res) => {
  var codeshort = req.body.shortcode;
  var removeid = req.body.removeid;

  const check = await inidb.findOne({ id: removeid });

  if (check == null) {
    res.render("remove", { aliasnull: true });
  } else {
    inidb.findOneAndDelete({ id: removeid }),
      res.render("index", {
        deleted: true,
        aliasnull: false,
        notavailable: false,
      });
  }
});

/*app.get('/count', async (req, res) => {
  res.status(200).json({
    data: {
      count: {
        shorted: counting
      }
    }
  })
})*/

const listener = app.listen(3000, () => {
  console.log("[ EXPRESS ] Your app listen on port " + listener.address().port);
});
