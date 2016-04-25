//express load fez o carregamento da var app para esse arq, basta passar como param
//podendo ser qualquer nome
module.exports = function(app){
  app.get('/pagamentos', function(req, res){
    res.send('OK pagamentos');
  });
}
