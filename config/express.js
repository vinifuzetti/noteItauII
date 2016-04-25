var express = require('express');
var load = require('express-load');

module.exports = function(){
  var app = express();
  //carrega as rotas sem precisar dar require do express nas rotas
  load('controllers', {cwd: 'app'}).into(app);

  return app;
}
