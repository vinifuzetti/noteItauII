var restify = require('restify');

function cartoesRestClient(){

  this._client	=	restify.createJsonClient({
    url:	'http://localhost:3000',
	  version:	'~1.0'
	});
}

cartoesRestClient.prototype.autoriza	=	function(cartao,	callback)	{
		this._client.post('/cartoes/autoriza',	cartao,	callback);
}

module.exports	=	function(){
		return	cartoesRestClient;
};
