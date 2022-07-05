// 1. Configurando el Streaming Speech Recognition API
var final_transcript = 'La siguiente es una conversación con la asistente AI. que es servicial, creativo, inteligente y práctico para ciertas cosas. \n\
\n\
Humano: Hola, ¿Quién eres?\n\
AI: Soy una inteligencia artificial creada por OpenAI. ¿En qué te puedo ayudar?\n\
Humano: ';
var completionWord = "control";
var temporary_status = 'Escuchando...';
document.body.innerHTML = temporary_status;
var recognizing = false;
var ignore_onend;
var start_timestamp;

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.onstart = function() {
  recognizing = true;
  temporary_status = "\n\nEscuchando...  Dile '"+completionWord+"' para terminar el mensaje.";
  updateStatus();
};
recognition.onerror = function(event) {
  if (event.error == 'no-speech') {
    temporary_status = "\n\nNo se detectó ninguna conversación...";
    updateStatus();
    ignore_onend = true;
  }
  if (event.error == 'audio-capture') {
    temporary_status = "\n\nNo se ha detectado ningún micrófono...";
    updateStatus();
    ignore_onend = true;
  }
  if (event.error == 'not-allowed') {
    temporary_status = "\n\nReconocimiento de Voz Bloqueado...";
    updateStatus();
    ignore_onend = true;
  }
};
recognition.onresult = function(event) {
  var interim_transcript = '';
  if (typeof(event.results) == 'undefined') {
    recognition.onend = null;
    recognition.stop();
    temporary_status = "\n\nEl Browser no soporta el reconocimiento de voz...";
    return;
  }
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final_transcript   += event.results[i][0].transcript;
    } else {
      interim_transcript += event.results[i][0].transcript;
    }
  }
  final_transcript         = capitalize(final_transcript);
  document.body.innerHTML  = linebreak (final_transcript);
  document.body.innerHTML += linebreak (interim_transcript);
  document.body.innerHTML += linebreak (temporary_status);
  
  if (final_transcript.toLowerCase().includes(completionWord)) {
    final_transcript = final_transcript.replace(new RegExp("\w* "+completionWord, "gi"), ".");
    recognition.stop();
  }
};
recognition.onend = function() {
  recognizing = false;
  if (ignore_onend) {
    if (temporary_status === "\n\nNo se detectó ninguna conversación...") {
      startButton();
  } return; }
  final_transcript += "\nAI:"; // <- NO SPACE AFTER THE COLON GRAAAAAGH
  temporary_status = "\n\nEsperando a la AI...";
  updateStatus();
  queryAPI();
};

function startButton() {
  if (recognizing) {
    recognition.stop();
    return;
  }
  recognition.start();
  ignore_onend = false;
}
startButton();

// 2. Envía a GPT-3 y recibe el streaming de respuesta.
if (!new URLSearchParams(window.location.search).has("key")) {
  window.history.replaceState({}, 'OpenAI Voice', "?key=sk-TuClaveAqui");
}
function queryAPI() {
  if (new URLSearchParams(window.location.search).get("key") === "sk-TuClaveAqui") {
    temporary_status = "\n\n--~*Ingresa tu Open AI API Key en esta barra de URL y actualiza!*~--\n\nEmocionante...";
    updateStatus();
    return;
  }

  let AIRequest = new SSE("https://api.openai.com/v1/engines/davinci/completions", {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": "Bearer "+ new URLSearchParams(window.location.search).get("key")
    },
    payload: JSON.stringify({
      "prompt": final_transcript,
      "max_tokens": 300,
      "temperature": 0.9,
      "top_p": 1,
      "n": 1,
      "stream": true,
      "logprobs": null,
      "stop": "\n",
    })
  });
  let messageHandler = function (e) {
    console.log(e.data);

    // Si finalizó de hablar, transferir a escucha de nuevo.
    if (e.data === "[DONE]"){// || !e.data || !JSON.parse(e.data).choices[0].text) {
      AIRequest.close();
      AIRequest.removeEventListener("message", messageHandler);
      speak('', true);
      final_transcript += "\nHumano: ";
      updateStatus();
      startIfDoneTalking();
      return;
    }

    // Otra manera de hablar lo que está recibiendo.
    speak(JSON.parse(e.data).choices[0].text);
  }.bind(this);
  AIRequest.addEventListener('message', messageHandler);
  AIRequest.stream();
}

var startIfDoneTalking = function () {
  setTimeout(() => {
    if (!window.speechSynthesis.speaking && !recognizing) {
      startButton();
    } else {
      startIfDoneTalking();
    }
  }, 1500);
}

// 3. Configurando el llenado del Streaming GPT-3 Info en el motor de Texto a Voz.
alert("Asegurate que tu OpenAI API Key fué añadida a la URL de arriba.\nEste diálogo también activa la sintetización de la voz.");

var synthesizedVoices = window.speechSynthesis.getVoices();
window.speechSynthesis.onvoiceschanged = (event) => {
  synthesizedVoices = window.speechSynthesis.getVoices();
}
function speakVoice(speech) {
  let speechUtterance = new SpeechSynthesisUtterance(speech);

  for (let i = 0; i < synthesizedVoices.length; i++){
    //console.log(synthesizedVoices[i]);
    if (synthesizedVoices[i].voiceURI === "Google español") { //Google US English, Google UK English Female, Google UK English Male
      speechUtterance.voice = synthesizedVoices[i];
    }
  }

  window.speechSynthesis.speak(speechUtterance);
}

var streamingResponse = '';
function speak(input = '', forceSpeak = false) {

  final_transcript  += input;
  if (input.includes(".")) {
    let curStrs = input.split(".");
    streamingResponse += curStrs[0] + ".";
    speakVoice(streamingResponse);
    streamingResponse = curStrs[1];
  }else if (input.includes("?")) {
    let curStrs = input.split("?");
    streamingResponse += curStrs[0] + "?";
    speakVoice(streamingResponse);
    streamingResponse = curStrs[1];
  }else if (input.includes("!")) {
    let curStrs = input.split("!");
    streamingResponse += curStrs[0] + "!";
    speakVoice(streamingResponse);
    streamingResponse = curStrs[1];
  } else {
    streamingResponse += input;
  }

  updateStatus();
}

// Funciones útiles
var two_line   = /\n\n/g;
var one_line   = /\n/g;
var first_char = /\S/;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function updateStatus() {
  document.body.innerHTML  = linebreak (final_transcript);
  document.body.innerHTML += linebreak (temporary_status);
}
