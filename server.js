const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });


app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'todoapplication',
    resave: false,
    saveUninitialized: true,
  }))
app.use(express.static('uploads'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
  });

app.get('/', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }
    fs.readFile('Data/data.json',(err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';
        res.render('index', {data: JSON.parse(data)});
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
    res.render('login');
});




app.post('/login',async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    fs.readFile('Data/UserData.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        let flag = true;
            dataObj.forEach((item) => {
                if (item.username == username && item.password == password) {
                    req.session.isLoggedIn = true;
                    req.session.username = username;
                    res.redirect('/');
                    flag = false;
                    return
                }
            });
        if(flag){
            res.redirect('/login');
        }
        
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
    fs.readFile('Data/UserData.json', (err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';
        let dataObj = JSON.parse(data);
        dataObj.push({ username: username, password: password , id: uuidv4()});
        fs.writeFile('Data/UserData.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.redirect('/login');
        });
    });
});


app.get('/todo', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.sendFile(__dirname + '/views/index.html');
});



app.post('/add', upload.single('imageFile'), (req, res) => {
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';
        let dataObj = JSON.parse(data); 
        dataObj.push({item: req.body.inputText, cheched: false, id: Date.now(), image: req.file.filename});
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
        });
        res.redirect('/');
    });
});

app.get('/todoData', (req, res) => {
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});


app.post('/delete', (req, res) => {
    console.log("ok");
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        dataObj.forEach((item, index) => {
            if (item.id == req.body.id) {
                dataObj.splice(index, 1);
                fs.unlink('uploads/' + item.image, (err) => {
                    if (err) throw err;
                }
                );
            }
        });
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.status(200).send("ok");
        });
    });
});

app.post('/update', (req, res) => { 
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        dataObj.forEach((item) => {
            if (item.id == req.body.id) {
                item.checked = req.body.checked;
            }
        });
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.status(200).send("ok");
        }); 
    });
});


//if url is not found redirect to home page
app.get('*', (req, res) => {
    res.redirect('/');
}
);

