var express = require('express');
var app = express();
const redis = require('redis');
const hbs = require('express-handlebars');
const bodyparser = require('body-parser');
const path = require('path');
const override = require('method-override');


const redis_port = 6379;
const port = 3000;

//Redis Client
const client = redis.createClient(redis_port);
client.on('connect',()=>{
    console.log('Connected to Redis')
});

app.engine('handlebars',hbs({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use(override('_method'));
//Search Page
app.get('/',(req,res)=>{
    res.render('searchusers');
});
// Add User Page
app.get('/user/add',(req,res)=>{
    res.render('adduser')
});

// Add User Procesing
app.post('/user/add',(req,res,next)=>{
    let FirstName= req.body.FirstName;
    let LastName = req.body.LastName;
    let Age = req.body.Age;
    let Email = req.body.Email;

    client.hmset(FirstName,[
        'FirstName',FirstName,
        'LastName',LastName,
        'Age',Age,
        'Email',Email
    ],(err,reply) =>{
        if(err){
            console.log(err);
        }
        else{
            console.log(reply);
            res.redirect('/');
        }
    }
    )
});



//Search Processing
app.post('/user/search',(req,res,next)=>{
  let name = req.body.name;

  client.hgetall(name,(err,obj)=>{
      if(!obj){
          res.render('searchusers',{
              error:'User does not exist'
          });
      }
      else{
          obj.name = name;
          obj.Email = obj.Email.replace("q","@");
          res.render('details',{
              
              user:obj
          });
      }
  })
});

app.listen(3000,()=>{
    console.log('Server is running.')
});



