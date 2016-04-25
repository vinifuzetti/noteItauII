//express load fez o carregamento da var app para esse arq, basta passar como param
//podendo ser qualquer nome
module.exports = function(app){
  app.get('/pagamentos', function(req, res){
    res.send('OK pagamentos');
  });

  //os parametros da funcao obedece a ordem dos paramentros
  app.post('/pagamentos/pagamento', function(req, res){
    //validacao dos dados recebidos
    req.assert('forma_de_pagamento','Indique a forma de pagamento').notEmpty();
    req.assert('valor', 'Indique o valor numerico').notEmpty().isFloat();
    req.assert('moeda', 'Indique a moeda no formato BRL').notEmpty().len(3,3);
    var errors = req.validationErrors();
    if (errors){
      console.log("Erros de validação encontrados");
      res.status(400).json(errors);
      return;
    }

    var pagamento = req.body;
    var connection = app.infra.connectionFactory();
    var pagamentoDAO = new app.infra.PagamentoDao(connection);

    pagamento.status = 'CRIADO';
    pagamento.data = new Date;
    pagamentoDAO.salva(pagamento, function(error, result){
      if(error){
        res.status(500).send(error);
        return;
      }
      pagamento.id = result.insertId;
      //console.log('pagamento criado com sucesso:	'	+	JSON.stringify(pagamento));
      console.log('Pagamento criado com ID: ' + pagamento.id);
      res.location('/pagamentos/pagamento/' + pagamento.id)
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
    //res.json(pagamento);
    //console.log('Ok');
  });
}
