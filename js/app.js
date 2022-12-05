`
Aurto: Leonardo Rivera.
Email: leonardorivera1004@gmail.com
Nota: Aplicacion realizada con la finalidad de practicar diferentes Funcionalidades de javascript, html y css.


`
let click_on = false;
let m=25;
let s=0;
let time= null;
const audio = new Audio();
audio.src = "audio/click.mp3"
const audio_alert = new Audio();
audio_alert.src = "audio/alert.mp3"
const audio_error = new Audio();
audio_error.src = "audio/error.mp3"


function backgroundBlue(){
    $( "body" ).animate({
      
        backgroundColor: "rgb(76, 145, 149)"
  
      },1500);
      $( ".btn-start" ).animate({
        
          color: "rgb(76, 145, 149)"
    
        },1500);



}
function backgroundBlue2(){
  $( "body" ).animate({
    
      backgroundColor: "rgb(76, 99, 149)"

    },1500);
    $( ".btn-start" ).animate({
      
        color: "rgb(76, 99, 149)"
  
      },1500);



}
function backgroundRed(){
    $( "body" ).animate({
      
        backgroundColor: "rgb(217, 85, 80)"
  
      },1500);
      $( ".btn-start" ).animate({
        
          color: "rgb(217, 85, 80)"
    
        },1500);



}


//------------------------------------------------------------  
window.addEventListener( 'load', () => {
  let minuto=m;
  let segundos=s;


  if(m<10){
    minuto="0"+m;
  }
  if(s<10){
    segundos="0"+s;
  }
  document.getElementById('reloj').textContent=minuto+':'+segundos;
  startQueries()
  })
//------------------------------------------------------------  
const startQueries = () => {
  let newQuery = window.matchMedia( ' ( max-width: 500px ) ' )
  const queryListenChanges = query => {
    if( query.matches ){
      document.getElementById("btn-config").innerHTML='<i class="bi bi-gear"> </i>';
    
    }else{
      document.getElementById("btn-config").innerHTML='<i class="bi bi-gear"> </i>Configuracion';
      
    
    
    }
  }
  
  newQuery.addListener( queryListenChanges )
  
}
//------------------------------------------------------------  

  $( "#btn-dg" ).click(function() {
    clearInterval(time);
    $(".btn-start").removeClass("btn-start-on")
    document.getElementById("btn-inicio").innerText='COMENZAR'
    click_on = false;
    backgroundBlue2();
    m=15;
    s=0;
    document.getElementById('reloj').textContent='15:00';
    document.getElementById('mensaje').textContent='¡Es hora de un descanso grande!';
    $( "#btn-dg" ).addClass('oction-active')
    $( "#btn-dp" ).removeClass('oction-active')
    $( "#btn-pomodoro" ).removeClass('oction-active')

  });

  $( "#btn-dp" ).click(function() {
    clearInterval(time);
    $(".btn-start").removeClass("btn-start-on")
    document.getElementById("btn-inicio").innerText='COMENZAR'
    click_on = false;
    backgroundBlue();
    m=5;
    s=0;
    document.getElementById('reloj').textContent='05:00';
    document.getElementById('mensaje').textContent='¡Es hora de un pequeño descanso!';


    $( "#btn-dg" ).removeClass('oction-active')
    $( "#btn-dp" ).addClass('oction-active')
    $( "#btn-pomodoro" ).removeClass('oction-active')

  });

  $( "#btn-pomodoro" ).click(function() {
    clearInterval(time);
    $(".btn-start").removeClass("btn-start-on")
    document.getElementById("btn-inicio").innerText='COMENZAR'
    click_on = false;
    backgroundRed()
    m=25;
    s=0;
    document.getElementById('reloj').textContent='25:00';
    document.getElementById('mensaje').textContent='¡Es hora de concentrarse!';
    $( "#btn-dg" ).removeClass('oction-active')
    $( "#btn-dp" ).removeClass('oction-active')
    $( "#btn-pomodoro" ).addClass('oction-active')

  });
 
  $("#btn-inicio").click( function(){
    
    $(".btn-start").toggleClass("btn-start-on");
    if(click_on==false){
      document.getElementById("btn-inicio").innerText ='PAUSAR';
      click_on=true;
      
      time= setInterval(function(){
    
        let minuto="";
        let segundos="";
      
      
        if(s==0){
          m=m-1;
          s=59;
        }else{
          s=s-1;
        }
        minuto=m;
        segundos=s;
      
      
        if(m<10){
          minuto="0"+m;
        }
        if(s<10){
          segundos="0"+s;
        }
      
        document.getElementById('reloj').textContent=minuto+':'+segundos;
        if(m==0  && s==0){
          $(".btn-start").toggleClass("btn-start-on");
          document.getElementById("btn-inicio").innerText='COMENZAR'
          click_on=false;
          audio_alert.play()
          clearInterval(time);
      }
      
      
      
      },1000);
      
      

    }else{
      document.getElementById("btn-inicio").innerText='COMENZAR'
      click_on=false;
      clearInterval(time);

    }
    
  }
  );
  

  $("#btn-config").click(function(){
    $("#inputMinute").val(m);
    $("#inputseconds").val(s);

  })

  $("#btn-guardar").click(function () {
    
    let validar_m = document.getElementById('inputMinute').value;
    let validar_s = document.getElementById('inputseconds').value;

    if(Number.isInteger(Number( validar_m)) != true && Number.isInteger(Number( validar_m)) != true ){
      
      
      audio_error.play();
      document.getElementById("mensaje2").innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Aviso!</strong> Uno de los datos introducidos esta incorrecto.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`

    }else{
      
      validar_m = Number( validar_m);
      validar_s = Number( validar_s);
      if(validar_m<0 ||  validar_m>60 || validar_s<0 ||  validar_s>60 ){
        audio_error.played();
        document.getElementById("mensaje2").innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Aviso!</strong> Uno de los datos introducidos esta incorrecto.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
        
      }else{
        m = validar_m;
        s = validar_s;
        
  
  
        if(m<10){
          validar_m="0"+m;
        }
        if(s<10){
          validar_s="0"+s;
        }
        
        
        document.getElementById('reloj').textContent=validar_m+':'+validar_s;
      }
    }

    
  })


  





	

		
