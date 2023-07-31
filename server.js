const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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
    res.render('index', {username: req.session.username, error: null});
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/style.css');
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/views/script.js');
});

app.get('/about', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.render('about', {username: req.session.username});
});

app.get('/contact', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    res.render('contact', {username: req.session.username});
});

app.get('/login', (req, res) => {
    if(req.session.isLoggedIn) {
        res.redirect('/');
        return
    } 
    res.render('login', {error: null});
});

app.get('/home', (req, res) => {
    res.redirect('/');
});


app.post('/login', (req, res) => {
    
    let username = req.body.username;
    let password = req.body.password;
    fs.readFile('Data/UserData.json', (err, data) => {
        if (err) throw err;
        debugger;
        let flag = false;
        let dataObj = JSON.parse(data);
            dataObj.forEach((item) => {
                if (item.username == username && item.password == password) {
                    req.session.isLoggedIn = true;
                    req.session.username = username;
                    req.session.userId = item.id;
                    res.redirect('/');
                    flag = true;
                    return 
                }
            });
        if(!flag){
            res.render('login', {error: 'Invalid username or password'});
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
    let id = uuidv4();
    fs.readFile('Data/UserData.json', (err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';
        let dataObj = JSON.parse(data);
        dataObj.push({ username: username, password: password , id: id});
        fs.writeFile('Data/UserData.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            fs.readFile('Data/data.json', (err, data) => {
                if (err) throw err;
                if (data == '') data = '[]';
                let dataObj = JSON.parse(data);
                dataObj.push({id: id, todo: []});
                fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
                    if (err) throw err;
                });
            });
            res.redirect('/login');
        });
        // console.log(dataObj);
    });
});


app.get('/todo', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    } 
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        let a = JSON.parse(data);
        let b = a.filter((item) => {
            return item.id == req.session.userId;
        });
        res.render('todo', {username: req.session.username, data: b[0].todo});
    });
    
});



app.post('/add', (req, res) => {
    if(!req.session.isLoggedIn) {
        res.redirect('/login');
        return
    }
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        if (data == '') data = '[]';
        let dataObj = JSON.parse(data); 
        let sub = [];
        // dataObj.push(req.body);
        for(let i = 0; i < dataObj.length; i++) {
            if(dataObj[i].id == req.session.userId) {
                dataObj[i].todo.push(req.body);
                sub = dataObj[i].todo;
                break;
            }
        }

        //let dataObj = JSON.parse(data);
        //dataObj.push({id: req.session.userId, todo: []});
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(sub);
            
        });
        // res.redirect('/todo');
    });
});

app.get('/todoData', (req, res) => {
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});


app.post('/delete', (req, res) => {
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        let sub = [];
        for(let i = 0; i < dataObj.length; i++) {
            if(dataObj[i].id == req.session.userId) {
                for(let j = 0; j < dataObj[i].todo.length; j++) {
                    if(dataObj[i].todo[j].id == req.body.id) {
                        dataObj[i].todo.splice(j, 1);
                        sub = dataObj[i].todo;
                        break;
                    }
                }
                break;
            }
        }
        // dataObj.forEach((item, index) => {
        //     if (item.id == req.body.id) {
        //         dataObj.splice(index, 1);
        //     }
        // });
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(sub);
        });
    });
});

app.post('/update', (req, res) => { 
    fs.readFile('Data/data.json', (err, data) => {
        if (err) throw err;
        let dataObj = JSON.parse(data);
        let sub = [];
        for(let i = 0; i < dataObj.length; i++) {
            if(dataObj[i].id == req.session.userId) {
                for(let j = 0; j < dataObj[i].todo.length; j++) {
                    if(dataObj[i].todo[j].id == req.body.id) {
                        dataObj[i].todo[j].checked = req.body.checked;
                        sub = dataObj[i].todo;
                        break;
                    }
                }
                break;
            }
        }
        // dataObj.forEach((item) => {
        //     if (item.id == req.body.id) {
        //         item.checked = req.body.checked;
        //     }
        // });
        fs.writeFile('Data/data.json', JSON.stringify(dataObj), (err) => {
            if (err) throw err;
            res.send(sub);
        });
    });
});


//if url is not found redirect to home page
app.get('*', (req, res) => {
    res.redirect('/');
}
);

