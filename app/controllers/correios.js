module.exports = function(app){

  app.get('/correios/calcula-prazo',function(req,	res){
    var correiosSoapClient = new app.servicos.correiosSoapClient();
    var args = req.body;
    correiosSoapClient.calculaPrazo(args, function(err, result){
      if	(err){
				res.status(400).send(err);
        console.log('Erro ao calcular prazo');
			  return;
      }
      res.status(200).json(result);
    });
  });
}
