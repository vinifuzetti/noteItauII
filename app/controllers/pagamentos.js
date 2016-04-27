var	logger	=	require('../../app/infra/logger.js');

const	PAGAMENTO_CRIADO	=	"CRIADO";
const	PAGAMENTO_CONFIRMADO	=	"CONFIRMADO";
const	PAGAMENTO_CANCELADO	=	"CANCELADO";
//express load fez o carregamento da var app para esse arq, basta passar como param
//podendo ser qualquer nome
module.exports = function(app){

  app.get('/pagamentos', function(req, res){
    res.send('OK pagamentos');
  });

  app.get('/pagamentos/pagamento/:id', function(req, res){
    var	id	=	req.params.id;
		var	cache	=	app.infra.memcachedClient();

    logger.info('Busca em cache por pagamento com id:	'	+	id);
    cache.get('pagamento-'	+	id,	function	(err,	pag){
      if	(err	||	!pag){
        var	connection	=	app.infra.connectionFactory();
        var	pagamentoDao	=	new	app.infra.PagamentoDao(connection);
        pagamentoDao.buscaPorId(id,	function(exception,	result){
              cache.set('pagamento-'	+	id,	result,	100000, function	(err)	{
                logger.info('Nova	chave em cache:	pagamento-'	+	id)
              });
              res.status(200).json(result);
            });
      }	else	{
            res.status(200).json(pag);
      }
    });
  });

  //os parametros da funcao obedece a ordem dos paramentros
  app.post('/pagamentos/pagamento', function(req, res){

    var version = req.headers.appversion;
    //porquice de versionamento
    if (version == 'v1'){
      logger.info('Requisicao para versão 1');
    }else{
      logger.info('Requisicao para versão 2');
    }
    //validacao dos dados recebidos
    req.assert('dados_do_pagamento.forma_de_pagamento','Indique a forma de pagamento').notEmpty();
    req.assert('dados_do_pagamento.valor', 'Indique o valor numerico').notEmpty().isFloat();
    req.assert('dados_do_pagamento.moeda', 'Indique a moeda no formato BRL').notEmpty().len(3,3);
    var errors = req.validationErrors();
    if (errors){
      logger.info("Erros de validação encontrados");
      res.status(400).json(errors);
      return;
    }

    var	cache	=	app.infra.memcachedClient();
    var pagamento = req.body['dados_do_pagamento'];

    if(pagamento.forma_de_pagamento == 'cartao'){
      var cartao = req.body['dados_do_cartao'];
      var restClient = new app.servicos.cartoesRestClient();

      restClient.autoriza(cartao, function(error, request, response, ret){
          if	(error){
  					logger.info("Erro	ao	consultar	serviço	de	cartões");
  					res.status(400).send(error);
  					return;
  				}
          var connection = app.infra.connectionFactory();
          var pagamentoDAO = new app.infra.PagamentoDao(connection);
          pagamento.status = PAGAMENTO_CRIADO;
          pagamento.data = new Date;
          pagamentoDAO.salva(pagamento, function(error, result){
            if(error){
              res.status(500).send(error);
              return;
            }
            pagamento.id = result.insertId;
            //logger.info('pagamento criado ; com sucesso:	'	+	JSON.stringify(pagamento));
            logger.info('Pagamento criado com ID: ' + pagamento.id);
            cache.set('pagamento-'	+	pagamento.id,	pagamento,	100000, function	(err)	{
              logger.info('nova	chave em cache:	pagamento-'	+	pagamento.id)
            });
          });
          res.location('/pagamentos/pagamento/' + pagamento.id);

          response	=	{
              dados_do_pagamento: pagamento,
              dados_do_cartao: {status: ret.status},
              versao_do_app: {v: version},
              links:	[{
                        href:	"http://localhost:3000/pagamentos/pagamento/"	+	pagamento.id,
                        rel:	"confirmar",
                        method:	"PUT"
                        },
                        {
                        href:	"http://localhost:3000/pagamentos/pagamento/"	+	pagamento.id,
                        rel:	"cancelar",
                        method:	"DELETE"
              }]
          }

          res.status(201).json(response);
      });
    } else {

      var connection = app.infra.connectionFactory();
      var pagamentoDAO = new app.infra.PagamentoDao(connection);

      pagamento.status = PAGAMENTO_CRIADO;
      pagamento.data = new Date;
      pagamentoDAO.salva(pagamento, function(error, result){
        if(error){
          res.status(500).send(error);
          return;
        }
        pagamento.id = result.insertId;
        //logger.info('pagamento criado com sucesso:	'	+	JSON.stringify(pagamento));
        logger.info('Pagamento criado com ID: ' + pagamento.id);
        cache.set('pagamento-'	+	pagamento.id,	pagamento,	100000, function	(err)	{
          logger.info('nova	chave em cache:	pagamento-'	+	pagamento.id)
        });
        res.location('/pagamentos/pagamento/' + pagamento.id);
        var	response	=	{
            dados_do_pagamento:	pagamento,
            links:	[{
                      href:	"http://localhost:3000/pagamentos/pagamento/"	+	pagamento.id,
                      rel:	"confirmar",
                      method:	"PUT"
                      },
                      {
                      href:	"http://localhost:3000/pagamentos/pagamento/"	+	pagamento.id,
                      rel:	"cancelar",
                      method:	"DELETE"
            }]
        }
        res.status(201).json(response);
      });
    }
  });

  app.put('/pagamentos/pagamento/:id', function(req, res){

    var pagamento = {};
    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDao(connection);

    pagamento.status = PAGAMENTO_CONFIRMADO;
    pagamento.id = req.params.id;

    pagamentoDAO.status(pagamento, function(error, result){
      if(error){
        res.status(500).send(error);
        return;
      }
      logger.info('Pagamento CONFIRMADO com ID: ' + pagamento.id);
      res.status(200).json(pagamento);
    });
  });

  app.delete('/pagamentos/pagamento/:id', function(req, res){

    var pagamento = req.body;
    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDao(connection);

    pagamento.status = PAGAMENTO_CANCELADO;
    pagamento.id = req.params.id;

    pagamentoDAO.status(pagamento, function(error, result){
      if(error){
        res.status(500).send(error);
        return;
      }
      logger.info('Pagamento CANCELADO com ID: ' + pagamento.id);
      res.status(200).json(pagamento);
    });
  });
}
