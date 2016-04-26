var express = require('express');
var load = require('express-load');
var bp = require('body-parser');
var validator = require('express-validator');

module.exports = function(){
  var app = express();
  //os use devem ser feitos antes de carregar as rotas
  app.use(bp.json());
  app.use(bp.urlencoded({extended: true}));
  app.use(validator());

  //carrega as rotas sem precisar dar require do express nas rotas
  load('controllers', {cwd: 'app'})
        .then('infra')
        .then('servicos')
        .into(app);

  return app;
}
