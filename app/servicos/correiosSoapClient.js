var soap = require('soap');

function correiosSoapClient(){
  this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}

correiosSoapClient.prototype.calculaPrazo = function(args, callback){
  soap.createClient(this._url, function(err, client){
    client.CalcPrazo(args,	callback);
  });

}
module.exports = function(){
  return correiosSoapClient;
}
