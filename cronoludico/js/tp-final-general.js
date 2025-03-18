//Cronolúdico

//Es crucial permanecer en el presente evitando los bucles del pasado y/o del futuro
//Los hechos contrafacticos cambiam el pasado y/o el futuro
//el primer turno siempre sera del jugador

let arrJugadores = []; //arreglo de objetos donde se registran los jugadores como objetos
let arrParalelos = []; //arreglo de objetos donde se registran versiones paralelas a cada partida
let resultados = document.querySelector('#divR'); //muestrs los resultados
let botonReg = documemt.querySelector('#btnReg'); //registro de usuarios
let botonRei = document.querySelector('#btnRei'); //reinicio del juego
let botonJugar = document.querySelector('#btnJugar'); //inicia la partida
let botonPasado = document.querySelector('#btnPas'); //atraza el cronómetro hacia el pasado
let botonFuturo = document.querySelector('#btnFut'); //adelanta el cronómetro hacia el futuro
let bucleInf = 0; //genera un bucle y se pierde la partida
let botonContrafactico = document.querySelector('#btnCf'); //se puede utilizar en cualquier momento y cambia el pasado y el futuro por uno de los modelos paralelos generados
let crono = 0; //contador del tiempo
let azar = 0; //azar inicial
let ganador; //vencedores
let cronoCpu; //jugador oponente;
let puntaje; //registra el último mejor tiempo


botonReg.addEventListener('click', function(e)
{
    e.preventDefault();
    
    let nombre = document.querySelector('#campoNom').value;
    if(nombre === '')
    {
        alert('El campo nombre no puede estar vacío.');
        return false;
    }
    
    for(let i=0; i<arrJugadores.length; i++)
    {
        if(nombre === arrCompra[i].nomObj)
        {
            alert('Este jugador ya fue ingresado.');
            return false;
        }
    }
    
    arrJugadores.push(nombre);
    
    vaciar();
})

botonJugar.addEventListener('click', function(e)
{
    e.preventDefault();
    Math.random();
    
    let tiempo = document.querySelector('#campoT').value;
    if(tiempo === '')
    {
        alert('El campo tiempo no puede estar vacío.');
        return false;
    }
    
    if(tiempo === azar)
    {
        tiempo = azar;
        alert('¡Felicitaciones venciste a crono!');
    }
})

function vaciar()
{
    document.querySelector('#campoNom').value = '';
    document.querySelector('#campoT').value = '';
}

////////////

botonRei.addEventListener('click', function(e)
{
    e.preventDefault();
    arrJugadores.length = 0;
    arrParalelos.length = 0;
    vaciar();
})

botonFuturo.addEventListener('click', function(e)
{
    e.preventDefault();
    if(tiempo < 0)
    {
        let valorFuturo = Math.random()+1;
        tiempo += valorFuturo;
    }
    vaciar();
})

botonPasado.addEventListener('click', function(e)
{
    e.preventDefault();
    if(tiempo > 0)
    {
        let valorPasado = Math.random()-1;
        tiempo -= valorPasado;
    }
    vaciar();
})

botonContrafactico.addEventListener('click', function(e)
{
    e.preventDefault();
    
    tiempoMuerto = tiempo;
    if(tiempoMuerto < 0)
    {
        Math.random();
    }
    else
    {
        Math.random();
    }
    
    for(let i; i <; i++)
    {
        let paraleloObj =
        {
            tiempoMin: tiempoPasado,
            tiempoMax: tiempoFuturo
        }
        
        arrParalelos.push(paraleloObj);
    }
})