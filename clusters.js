var	cluster	=	require	('cluster');
var	os	=	require('os');
//numero de nucleos do processador
const	CPUS	=	os.cpus();

if	(cluster.isMaster)	{
  CPUS.forEach(function () {
    cluster.fork();
  });
  cluster.on("listening",	function(worker) {
    console.log("cluster	%d	conectado",	worker.process.pid);
  });
  cluster.on("disconnect", function(worker) {
    console.log("cluster	%d	desconectado",	worker.process.pid);
  });
  cluster.on("exit", function(worker) {
    console.log("cluster	%d	perdido",	worker.process.pid);
    cluster.fork();
  });
}	else	{
  require('./index.js');
}
