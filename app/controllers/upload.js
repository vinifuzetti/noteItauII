var	fs	=	require('fs');
var	zlib	=	require('zlib');

module.exports	=	function(app)	{

  app.post("/upload/gzip/:v",function(req,	res)	{
    var version = req.headers.v;
    var	arquivo	=	req.headers.filename;
    console.log('Arquivo recebido:	'	+	arquivo + 'na versão do app ' + version);

    req.pipe(zlib.createGunzip())
      .pipe(fs.createWriteStream("files/"	+	arquivo))
      .on('finish',	function(){
        res.writeHead(201,	{'Content-type':	'text/plain'});
        res.end('UPLOAD feito com sucesso');
        console.log('arquivo	salvo:	files/'	+	arquivo);
      });
  });
}
