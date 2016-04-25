var express = require('express');
var load = require('express-load');
var bp = require('body-parser');

module.exports = function(){
  var app = express();
  //os use devem ser feitos antes de carregar as rotas
  app.use(bp.json());
  app.use(bp.urlencoded({extended: true}));
  //carrega as rotas sem precisar dar require do express nas rotas
  load('controllers', {cwd: 'app'}).into(app);

  return app;
}
