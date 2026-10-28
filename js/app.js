/**
 * Autor: Leonardo Rivera.
 * Email: leonardorivera1004@gmail.com
 * Nota: Aplicación realizada con la finalidad de practicar diferentes funcionalidades de JavaScript, HTML y CSS.
 */

// Variable para controlar si el temporizador está en marcha (false = detenido, true = corriendo)
let click_on = false;

// Variables para almacenar minutos y segundos del temporizador
let m = 25;  // Minutos iniciales (25 min = sesión Pomodoro estándar)
let s = 0;   // Segundos iniciales

// Variable para almacenar el ID del intervalo (setInterval) para poder cancelarlo con clearInterval
let time = null;

// Variable para identificar qué pantalla/modo está activo (1=descanso grande, 2=descanso pequeño, 3=pomodoro)
let numScreen = 3;

// Objetos de audio para efectos de sonido
const audio = new Audio();
audio.src = "audio/click.mp3";       // Sonido de clic en botones

const audio_alert = new Audio();
audio_alert.src = "audio/alert.mp3"; // Sonido de alarma al terminar el tiempo

const audio_error = new Audio();
audio_error.src = "audio/error.mp3"; // Sonido de error en validaciones

// Clave usada para persistir la configuración del usuario en localStorage
const STORAGE_KEY = "pomodoro-config";

// Límites aceptados en el modal de configuración
const TIEMPO_MINIMO = 0;
const TIEMPO_MAXIMO = 60;

/**
 * Reproduce una pista de audio sin interrumpir la lógica si el navegador
 * bloquea la reproducción (políticas de autoplay) o el audio no está disponible.
 */
function reproducirSonido(pista) {
    try {
        const reproduccion = pista.play();
        if (reproduccion && typeof reproduccion.catch === "function") {
            reproduccion.catch(() => {});
        }
    } catch (error) {
        // El audio es un extra: un fallo aquí no debe romper el temporizador
    }
}

/**
 * Convierte el valor de un input en un número entero válido dentro de rango.
 * Devuelve null si el valor está vacío, no es un entero o está fuera de rango.
 */
function parsearTiempo(valor) {
    const texto = String(valor).trim();

    // Solo se aceptan dígitos: descarta negativos, decimales, "abc", etc.
    if (!/^\d+$/.test(texto)) {
        return null;
    }

    const numero = Number(texto);
    if (!Number.isInteger(numero) || numero < TIEMPO_MINIMO || numero > TIEMPO_MAXIMO) {
        return null;
    }

    return numero;
}

/**
 * Devuelve el tiempo y el mensaje por defecto de cada modo.
 * 1 = descanso grande, 2 = descanso pequeño, 3 = pomodoro
 */
function tiempoDeModo(modo) {
    switch (modo) {
        case 1:
            return { minutos: 15, segundos: 0, mensaje: "¡Es hora de un descanso grande!" };
        case 2:
            return { minutos: 5, segundos: 0, mensaje: "¡Es hora de un pequeño descanso!" };
        default:
            return { minutos: 25, segundos: 0, mensaje: "¡Es hora de concentrarse!" };
    }
}

/**
 * Guarda la configuración del usuario para conservarla tras recargar la página.
 */
function guardarConfiguracion(minutos, segundos) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ minutos, segundos }));
    } catch (error) {
        // localStorage puede estar deshabilitado (modo privado, cuota llena, etc.)
    }
}

/**
 * Recupera la configuración guardada, validándola antes de devolverla.
 * Devuelve null si no hay datos o si son inválidos.
 */
function cargarConfiguracion() {
    try {
        const guardado = window.localStorage.getItem(STORAGE_KEY);
        if (!guardado) {
            return null;
        }

        const configuracion = JSON.parse(guardado);
        const minutos = parsearTiempo(configuracion.minutos);
        const segundos = parsearTiempo(configuracion.segundos);

        if (minutos === null || segundos === null) {
            return null;
        }

        return { minutos, segundos };
    } catch (error) {
        return null;
    }
}

/**
 * Dibuja en el reloj los minutos y segundos actuales con dos dígitos.
 */
function actualizarReloj() {
    const minutos = String(Math.max(m, 0)).padStart(2, "0");
    const segundos = String(Math.max(s, 0)).padStart(2, "0");
    document.getElementById("reloj").textContent = minutos + ":" + segundos;
}

/**
 * Muestra el aviso de validación en el modal de configuración.
 */
function mostrarAviso() {
    document.getElementById("mensaje2").innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>¡Aviso!</strong> Uno de los datos introducidos esta incorrecto.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

/**
 * Detiene el intervalo activo y deja el temporizador en estado pausado.
 */
function detenerTemporizador() {
    if (time !== null) {
        clearInterval(time);
    }
    time = null;
    click_on = false;
    $(".btn-start").removeClass("btn-start-on");
    document.getElementById("btn-inicio").textContent = "COMENZAR";
}

/**
 * Cambia el color de fondo del body y el botón de inicio a un tono pastel
 * verde agua (modo descanso pequeño). Usa animación jQuery de 1.5 segundos
 */
function backgroundBlue() {
    $("body").animate({
        backgroundColor: "rgb(183, 220, 213)"
    }, 1500);
    $(".btn-start").animate({
        color: "rgb(74, 124, 117)"
    }, 1500);
}

/**
 * Cambia el color de fondo del body y el botón de inicio a un tono pastel
 * azul lavanda (modo descanso grande). Usa animación jQuery de 1.5 segundos
 */
function backgroundBlue2() {
    $("body").animate({
        backgroundColor: "rgb(194, 205, 237)"
    }, 1500);
    $(".btn-start").animate({
        color: "rgb(89, 105, 154)"
    }, 1500);
}

/**
 * Lee un color declarado como variable CSS en style.css (:root).
 * Si la variable no está disponible (por ejemplo en un entorno sin hoja de
 * estilos), devuelve el color de respaldo para no romper la animación.
 */
function colorDelTema(variable, respaldo) {
    if (typeof window.getComputedStyle !== "function") return respaldo;

    const valor = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();

    return valor || respaldo;
}

/**
 * Cambia el color de fondo del body y el botón de inicio a los colores
 * definidos en style.css (--bg y --accent) para el modo pomodoro/trabajo.
 * Usa animación jQuery de 1.5 segundos
 */
function backgroundRed() {
    $("body").animate({
        backgroundColor: colorDelTema("--bg", "rgb(242, 183, 177)")
    }, 1500);
    $(".btn-start").animate({
        color: colorDelTema("--accent", "rgb(166, 93, 87)")
    }, 1500);
}

// ------------------------------------------------------------
// Evento que se ejecuta cuando la página termina de cargar
// ------------------------------------------------------------
window.addEventListener('load', () => {
    // Restaurar la última configuración guardada por el usuario (si existe)
    const configuracion = cargarConfiguracion();
    if (configuracion) {
        m = configuracion.minutos;
        s = configuracion.segundos;
    }

    // Mostrar tiempo inicial en el elemento reloj
    actualizarReloj();

    // Iniciar consultas de medios (responsive)
    startQueries();
});

// ------------------------------------------------------------
// Función para manejar cambios en el tamaño de pantalla (responsive)
// ------------------------------------------------------------
const startQueries = () => {
    // Media query para pantallas de máximo 500px
    let newQuery = window.matchMedia('(max-width: 500px)');
    
    // Función que se ejecuta cuando cambia el estado de la media query
    const queryListenChanges = query => {
        if (query.matches) {
            // Pantalla pequeña: solo mostrar icono de engranaje
            document.getElementById("btn-config").innerHTML = '<i class="bi bi-gear"> </i>';
        } else {
            // Pantalla grande: mostrar icono + texto "Configuracion"
            document.getElementById("btn-config").innerHTML = '<i class="bi bi-gear"> </i>Configuracion';
        }
    };
    
    // Aplicar el estado inicial (si no, el móvil arranca con el texto)
    queryListenChanges(newQuery);

    // Registrar listener para cambios en la media query.
    // addEventListener es el estándar actual; addListener queda como respaldo.
    if (typeof newQuery.addEventListener === 'function') {
        newQuery.addEventListener('change', queryListenChanges);
    } else {
        newQuery.addListener(queryListenChanges);
    }
};

// ------------------------------------------------------------
// Eventos click para los botones de modo (modos del temporizador)
// ------------------------------------------------------------

/**
 * Aplica el tema visual que corresponde a cada modo.
 */
function aplicarTema(modo) {
    if (modo === 1) {
        backgroundBlue2();   // Azul oscuro: descanso grande
    } else if (modo === 2) {
        backgroundBlue();    // Azul verdoso: descanso pequeño
    } else {
        backgroundRed();     // Rojo: pomodoro/trabajo
    }
}

/**
 * Marca visualmente el botón del modo activo.
 */
function marcarModoActivo(modo) {
    $("#btn-dg").removeClass('oction-active');
    $("#btn-dp").removeClass('oction-active');
    $("#btn-pomodoro").removeClass('oction-active');

    const botones = { 1: "#btn-dg", 2: "#btn-dp", 3: "#btn-pomodoro" };
    $(botones[modo]).addClass('oction-active');
}

/**
 * Cambia de modo: detiene el temporizador y restaura el tiempo por defecto.
 */
function seleccionarModo(modo) {
    numScreen = modo;
    detenerTemporizador();            // Cancela cualquier intervalo en marcha

    const configuracion = tiempoDeModo(modo);
    m = configuracion.minutos;
    s = configuracion.segundos;

    actualizarReloj();
    document.getElementById('mensaje').textContent = configuracion.mensaje;
    aplicarTema(modo);
    marcarModoActivo(modo);
    reproducirSonido(audio);
}

// Botón "Descanso Grande" (15 minutos)
$("#btn-dg").click(function() {
    seleccionarModo(1);
});

// Botón "Descanso Pequeño" (5 minutos)
$("#btn-dp").click(function() {
    seleccionarModo(2);
});

// Botón "Pomodoro" (25 minutos - sesión de trabajo)
$("#btn-pomodoro").click(function() {
    seleccionarModo(3);
});

// ------------------------------------------------------------
// Evento click para el botón de Inicio/Pausa principal
// ------------------------------------------------------------

/**
 * Arranca la cuenta regresiva. Si ya hay un intervalo activo no crea otro
 * (protección contra dobles clics o dobles inicios).
 */
function iniciarTemporizador() {
    if (time !== null) {
        return; // Ya está corriendo: evitar intervalos duplicados
    }

    click_on = true;
    document.getElementById("btn-inicio").textContent = 'PAUSAR';
    $(".btn-start").addClass("btn-start-on");

    time = setInterval(function() {
        if (s === 0) {
            if (m === 0) {
                finalizarTemporizador();
                return;
            }
            m = m - 1;
            s = 59;
        } else {
            s = s - 1;
        }

        actualizarReloj();

        if (m === 0 && s === 0) {
            finalizarTemporizador();
        }
    }, 1000);
}

/**
 * Se ejecuta al llegar a 0:00: detiene el intervalo y avisa con sonido.
 */
function finalizarTemporizador() {
    detenerTemporizador();
    reproducirSonido(audio_alert);
}

$("#btn-inicio").click(function() {
    reproducirSonido(audio);

    // Si está corriendo, el clic pausa conservando el tiempo restante
    if (click_on && time !== null) {
        detenerTemporizador();
        return;
    }

    // Si el tiempo llegó a 0:00, restaurar el tiempo correspondiente al modo actual
    if (m <= 0 && s <= 0) {
        const configuracion = tiempoDeModo(numScreen);
        m = configuracion.minutos;
        s = configuracion.segundos;
        document.getElementById('mensaje').textContent = configuracion.mensaje;
        actualizarReloj();
    }

    iniciarTemporizador();
});

// ------------------------------------------------------------
// Evento click para botón de configuración (abre modal)
// ------------------------------------------------------------
$("#btn-config").click(function() {
    // Llenar inputs del modal con valores actuales
    $("#inputMinute").val(m);
    $("#inputseconds").val(s);
});

// ------------------------------------------------------------
// Evento click para botón guardar en modal de configuración
// ------------------------------------------------------------
$("#btn-guardar").click(function() {
    // Obtener valores de los inputs
    const validar_m = parsearTiempo(document.getElementById('inputMinute').value);
    const validar_s = parsearTiempo(document.getElementById('inputseconds').value);

    // Se validan AMBOS inputs: no deben estar vacíos, deben ser enteros y estar en rango
    if (validar_m === null || validar_s === null) {
        reproducirSonido(audio_error);
        mostrarAviso();
        return;
    }

    // Valores válidos: actualizar variables globales
    m = validar_m;
    s = validar_s;

    actualizarReloj();
    document.getElementById("mensaje2").innerHTML = '';

    // Guardar la configuración para conservarla al recargar la página
    guardarConfiguracion(m, s);
});
