const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const read = require('node-readability');
const Article = require('./db').Article;


app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req, res)=>{
  res.send('Hello World!');
});

app.get('/articles',(req, res, next)=>{
  Article.all((err, articles)=>{
    if(err) return next(err);
    res.send(articles);
  });
});

app.post('/articles', (req, res, next) => {
  console.log(req.body)
  const {title,content,url} = req.body;

  if(url) {
    read(url, (err, result)=>{
      if(err || !result) res.status(500).send('Error downloading article');
      Article.create({title:result.title, content:result.content},
        (err, article)=> {
          if(err) return next(err);
          res.send('OK');
        })
    })
  }else{
    const article = {title: title, content: content};
    Article.create(article, (err, article)=> {
      if(err) return next(err);
      res.send(article);
    });
  }

});

app.get('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  Article.find(id, (err, article)=>{
    console.log("Fetching ", id);
    if(err) return next(err);
    res.send(article);
  });
});

app.delete('/articles/:id', (req, res, next)=>{
  const id = req.params.id;
  Article.delete(id, (err)=>{
    if(err) return next(err);
    res.send({message:'Deleted'});
  });
});

app.listen(app.get('port'), ()=>{
  console.log(`Express web app available at:`, app.get('port')  )
})

module.exports = app;
