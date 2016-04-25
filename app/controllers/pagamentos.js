//express load fez o carregamento da var app para esse arq, basta passar como param
//podendo ser qualquer nome
module.exports = function(app){
  app.get('/pagamentos', function(req, res){
    res.send('OK pagamentos');
  });

  //os parametros da funcao obedece a ordem dos paramentros
  app.post('/pagamentos/pagamento', function(req, res){
    var body = req.body;
    res.json(body);
    console.log('Ok');
  });
}
