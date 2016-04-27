module.exports = function(app){

  app.get('/v1/correios/calcula-prazo',function(req,	res){
    var version = 'v1';
    console.log('Versão dos correios: ' + version);
    var correiosSoapClient = new app.servicos.correiosSoapClient();
    var args = req.body;
    correiosSoapClient.calculaPrazo(args, function(err, result){
      if	(err){
				res.status(400).send(err);
        console.log('Erro ao calcular prazo');
			  return;
      }
      result.versao = version;
      res.status(200).json(result);
    });
  });

  app.get('/v2/correios/calcula-prazo',function(req,	res){
    var version = '2';
    console.log('Versão dos correios: ' + version);
    var correiosSoapClient = new app.servicos.correiosSoapClient();
    var args = req.body;
    correiosSoapClient.calculaPrazo(args, function(err, result){
      if	(err){
        res.status(400).send(err);
        console.log('Erro ao calcular prazo');
        return;
      }
      result.versao = version;
      res.status(200).json(result);
    });
  });
}
