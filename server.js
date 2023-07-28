const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'todoapplication',
    resave: false,
    saveUninitialized: true,
  }))

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


app.get('/', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 

    res.sendFile(__dirname + '/views/index.html');
    
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/views/script.js');
});


app.get('/about', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.sendFile(__dirname + '/views/about.html');
});

app.get('/contact', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.sendFile(__dirname + '/views/contact.html');
});

app.get('/login', (req, res) => {
    if(req.session.isLoggedIn) {
        res.redirect('/');
        return
    } 
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', (req, res) => {
    
    let username = req.body.username;
    let password = req.body.password;
    if (username == 'admin' && password == 'admin') {
        req.session.isLoggedIn = true;
        req.session.username = username; 
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/todo', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/home', (req, res) => {
    res.redirect('/');
});

app.post('/add', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';

        let dataObj = JSON.parse(data); 
        dataObj.push(req.body);
        fs.writeFile('data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(dataObj);
        });
    });
});

app.get('/todoData', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});


app.post('/delete', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        dataObj.forEach((item, index) => {
            if (item.id == req.body.id) {
                dataObj.splice(index, 1);
            }
        });
        fs.writeFile('data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(dataObj);
        });
    });
});

app.post('/update', (req, res) => { 
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        dataObj.forEach((item) => {
            if (item.id == req.body.id) {
                item.checked = req.body.checked;
            }
        });
        fs.writeFile('data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(dataObj);
        });
    });
});


//if url is not found redirect to home page
app.get('*', (req, res) => {
    res.redirect('/');
}
);

