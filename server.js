const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const multer  = require('multer');
const e = require('express');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
const db = require('./DB/db.js');
const User = require('./DB/User.js');
const Todo = require('./DB/TodoData.js');
const v2  = require('cloudinary');
var zlib = require('zlib');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'todoapplication',
    resave: false,
    saveUninitialized: true,
  }))
app.use(express.static('uploads'));

db.init().then(() => {
        console.log('Connected!');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
    }).catch((err) => {
        console.log(err);
});
app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
  });

  v2.config({ 
    cloud_name: 'dciyhiktq', 
    api_key: '43771218656****', 
    api_secret: '**************************',
  });




app.get('/', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }
    Todo.findOne({id: req.session.userId}).then((user) => {
        res.render('index', {username: req.session.username, data: user.todo});
    }).catch((err) => {
        console.log(err);
    });
});


app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/views/script.js');
});



app.get('/login', (req, res) => {
    if(req.session.isLoggedIn) {
        res.redirect('/');
        return
    } 
    res.render('login', {error: null});
});




app.post('/login',async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    User.findOne({username: username, password: password}).then((user) => {
        if(user) {
            req.session.isLoggedIn = true;
            req.session.username = username;
            req.session.userId = user.id;
            res.redirect('/');
        } else {
            res.render('login', {error: 'Invalid username or password'});
        }
    }).catch((err) => {
        console.log(err);
    });
});



app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});


app.post('/signup', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let id = uuidv4();

    User.create({username: username, password: password, id: id}).then(() => {
        console.log('User created');
        res.redirect('/login');
    }).catch((err) => {
        console.log(err);
    });
    Todo.create({id: id, todo: []}).then(() => {
        console.log('Todo created');
    }).catch((err) => {
        console.log(err);
    });

    
});

app.get('/todo', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.sendFile(__dirname + '/views/index.html');
});



app.post('/add', upload.single('imageFile'),async (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }
    
    await v2.uploader.upload(req.file.path, async (result , err) => {
        if(err) console.log(err);
        await Todo.findOne({id: req.session.userId}).then((user) => {
            user.todo.push({item: req.body.inputText, checked: false, id: Date.now(), image: req.file.filename, public_id: result.public_id});
            user.save();
            res.redirect('/');
            fs.unlink('uploads/' + req.file.filename, (err) => {
                if (err) throw err;
            });
        }).catch((err) => {
            console.log(err);
        });
    });
});

app.get('/todoData', (req, res) => {
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});


app.post('/delete', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }

    Todo.findOne({id: req.session.userId}).then((user) => {
        user.todo.forEach((item) => {
            if(item.id == req.body.id) {
                v2.api.delete_resources([item.public_id], 
                            { type: 'upload', resource_type: 'image' });
            }
        });
        user.todo = user.todo.filter((item) => {
            return item.id != req.body.id;
        });
        user.save().then(() => {
            console.log('Deleted');
            res.status(200).send(user.todo);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/update',async (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }
    await Todo.findOne({id: req.session.userId}).then((user) => {
        let i1 = [];
        user.todo.forEach((item) => {
            if(item.id == req.body.id) {
                item.checked = req.body.checked;
                
            }
        });
        li = user.todo;
        user.todo = [];
        user.todo = li;
        user.save().then(() => {
            console.log('Updated');
            res.status(200).send(user.todo);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });

});


//if url is not found redirect to home page
app.get('*', (req, res) => {
    res.redirect('/');
}
);

