var express = require('express');
var load = require('express-load');
var bp = require('body-parser');
var validator = require('express-validator');
var	morgan	=	require('morgan');
var	logger	=	require('../app/infra/logger.js');
var	cors	=	require('cors');

module.exports = function(){
  var app = express();
  //os use devem ser feitos antes de carregar as rotas
  app.use(bp.json());
  app.use(bp.urlencoded({extended: true}));
  app.use(validator());
  app.use(morgan('common',{
    stream:	{
      write: function(message){
        logger.info(message)
      }
    }
  }));
  //aceita requisições apenas do origin declarado abaixo
  app.use(cors({
    origin:	'http://localhost:3001',
    methods:	["GET",	"POST",	"PUT",	"DELETE"],
    allowedHeaders:	"Content-type"
  }));

  //carrega as rotas sem precisar dar require do express nas rotas
  load('controllers', {cwd: 'app'})
        .then('infra')
        .then('servicos')
        .into(app);

  return app;
}
