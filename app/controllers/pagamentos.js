const	PAGAMENTO_CRIADO	=	"CRIADO";
const	PAGAMENTO_CONFIRMADO	=	"CONFIRMADO";
const	PAGAMENTO_CANCELADO	=	"CANCELADO";

//express load fez o carregamento da var app para esse arq, basta passar como param
//podendo ser qualquer nome
module.exports = function(app){
  app.get('/pagamentos', function(req, res){
    res.send('OK pagamentos');
  });

  //os parametros da funcao obedece a ordem dos paramentros
  app.post('/pagamentos/pagamento', function(req, res){
    //validacao dos dados recebidos
    req.assert('dados_do_pagamento.forma_de_pagamento','Indique a forma de pagamento').notEmpty();
    req.assert('dados_do_pagamento.valor', 'Indique o valor numerico').notEmpty().isFloat();
    req.assert('dados_do_pagamento.moeda', 'Indique a moeda no formato BRL').notEmpty().len(3,3);
    var errors = req.validationErrors();
    if (errors){
      console.log("Erros de validação encontrados");
      res.status(400).json(errors);
      return;
    }

    var pagamento = req.body['dados_do_pagamento'];
    if(pagamento.forma_de_pagamento == 'cartao'){
      var cartao = req.body['dados_do_cartao'];
      var restClient = new app.servicos.cartoesRestClient();

      restClient.autoriza(cartao, function(error, request, response, ret){
          if	(error){
  					console.log("Erro	ao	consultar	serviço	de	cartões");
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
            //console.log('pagamento criado com sucesso:	'	+	JSON.stringify(pagamento));
            console.log('Pagamento criado com ID: ' + pagamento.id);
          });
          res.location('/pagamentos/pagamento/' + pagamento.id);

          response	=	{
              dados_do_pagamento: pagamento,
              dados_do_cartao: {status: ret.status},
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
        //console.log('pagamento criado com sucesso:	'	+	JSON.stringify(pagamento));
        console.log('Pagamento criado com ID: ' + pagamento.id);
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
      console.log('Pagamento CONFIRMADO com ID: ' + pagamento.id);
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
      console.log('Pagamento CANCELADO com ID: ' + pagamento.id);
      res.status(200).json(pagamento);
    });
  });
}
