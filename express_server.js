const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
// var cookieSesssion = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function generateRandomString(length, arr) {
  let ans = "";
  for (let i = length; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)]; 
  }
  return ans;
  // alternativly below;
  // let ans = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
// something is broken with importing this. Need to fix
//const generateRandomString = require('randomString.js'); 

// ======================  Middleware setup  ================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// ======================= set up for modules ===================
const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID:"aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
};

function getUserByEmail(email, usersDatabase) {
  const keys = Object.keys(usersDatabase);
  for (let key of keys){
    const user = usersDatabase[key];
    if (user.email === email) {
      return user;
    }
  }
};
function urlsForUser(id){
  // implement here
}
function getUrlKey(parameter, urlDatabase) {
  const keys = Object.keys(urlDatabase);
  for (let key of urlDatabase) {
    const urlDbKey = urlDatabase[key];
    if(parameter)
    return key;
  }
}


// ===================  Below is page structure =====================
// changing from current to Most specific --> least specific


//Edit function // below is not strictly necessary;
app.get('/urls/:shortURL/edit', (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);  
});

app.post(`/urls/:shortURL/edit`, (req, res) => {
  const shortId = req.params.shortURL;
  const newLongId = req.body.longURL;
  urlDatabase[shortId]["longURL"] = newLongId;
  console.log(urlDatabase);
  res.redirect('/urls');
});



//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  if (!user_id || user_id !== user.id) {
    res.redirect("/login");
    return;
  };

  // Step 1 - check th user obj
  for (let users in usersDatabase) {
    if (usersDatabase[users] !== req.cookies["user_id"]) {
      res.redirect("/login");
    }
  }
  // // Step 2 
  // else {
  //   res.redirect('')
  // }
  // Step 3 - if cookie, pack the user info into a userObj & render usls_new with the obj
  let templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
}); 

app.get("/u/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  //below redirects to whichever website is associated with the short URL
  res.redirect(urlDatabase[id]["longURL"]);
})

//This is the edit page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  const templateVars = {
    user,
    longURL: urlDatabase[shortURL]["longURL"], 
    shortURL
  };
  res.render("urls_show", templateVars);
});


// visualisation of the database // security issue
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/users.JSON", (req, res) => {
  res.json(usersDatabase);
});
//

app.get("/urls", (req, res) => {
  // // 1. user has not login
  // const templateVars = {
  //   user_id: null,
  //   urls: urlDatabase,
  //   email: null
  // }; 
  // // 2. user has login
  // const templateVars = {
  //   user_id: req.cookies["user_id"],
  //   urls: urlDatabase,
  //   email: usersDatabase[id].email
  // };
  // =======================TESTING Below ====================================
  // ## below just sets a cookie testing 
  res.cookie("visitor", "guest");
  console.log("cookies; ", req.cookies.visitor); // But this one is  "guest"
  console.log("cookies; ", req.cookies.user_id); // why is this undefined ??
  // probs should delete above visitor cookie
  // deleted guest cookie on line  248 // does not work as intended
  // =======================TESTING Above ====================================
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  // // Below blocks access if the user is not logged in;
  if (!user) {
      res.redirect("/login");
      return;
    }
    // eventually add conditional statement for truthy / falsy of user
    
  
  const templateVars = {
    user,
    urls: urlDatabase, // possibly add ["longURL"] // Be aware of this. only this object should have urls: as urlDatabase.
  };
  res.render("urls_index", templateVars);
});

// Below accepts the form from /urls/new
// makes the new widget
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const idString = generateRandomString(6, arr);
  // const longURL = urlDatabase[shortURL];
  urlDatabase[idString]["longURL"] = req.body.longURL;
  // Below redirects the user to their new short URL address
  res.redirect(`/urls/${idString}`);
});

// registration page
app.get("/register", (req, res) =>{
  const templateVars = {
    user: undefined,
  };
  res.render('register', templateVars);
})

// registration data recieved from user
app.post("/register", (req, res) => {
  const idNum = generateRandomString(6,arr);
  const userObject = {
    id: idNum,
    email: req.body.email,
    password: req.body.password,
  };
  console.log("userObject; ", userObject);
  console.log("database ", usersDatabase);
  // below should check the new input vs the existing database
  for (let user_id in usersDatabase) {
    // console.log("~~~ ########", user_id, userObject.email,usersDatabase[user_id].email);
    if (userObject.email === usersDatabase[user_id].email) {
      res.status(400)
        .send("Email already registered");
        // 400s if browsers or users fault roughly
        // 500s server fault
      return;
    }
  };
  // JH Below checks if the email and password fields are aemopty and returns a 404 if true
  if (userObject.email === "" || userObject.password === "") {
    res.status(400)
      .send("Page Not Found");
    return;
  };

  usersDatabase[idNum] = userObject;
  console.log("this is the object; ", usersDatabase[idNum]);
  console.log(usersDatabase);
  res.cookie('user_id', idNum);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let objVar = {
    //not sure if this is correct;
    user: undefined 
  };
  res.render("login", objVar);
});

// logout method // NO logout Get
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// login user method
app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password =  req.body.password;
  console.log("email;", email);
  console.log("pwd");
  //Below checks that login details have been entered;
  if (!email || !password) {
    res.status(400)
      .send("Please enter details");
    return;
  };

  // Below checks the presence of a user account
  const user = getUserByEmail(email, usersDatabase);
  if (!user || user.password !== password) {
    res.status(403)
      .send("invalid username or password");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");  
});



app.get("/", (req, res) => {
res.send("Bonjour!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
