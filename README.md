# Interface de Voz de OpenAI API
- Demo: [https://avilaroman.github.io/OpenAIVoice/](https://avilaroman.github.io/OpenAIVoice)

### Necesitas una OpenAI API KEY para correr tu propio experimento.
- Solo deberán registrarse en beta.openai.com/signup y comenzar a experimentar con la API. Generar su propia key (es gratis) y luego usarla en la URL del proyecto.
Esta es una pequeña aplicación de ejemplo de voz a voz simple para la API de OpenAI. Simplemente pegue su clave secreta en el campo URL, haga clic en la alerta (la interacción del usuario es necesaria para activar la síntesis de voz) y habilite su micrófono. Esto solo se ha probado en Windows en Chrome 83 y es poco probable que funcione en otros navegadores.

Este proyecto solo depende de [sse.js](https://github.com/mpetazzoni/sse.js) para publicar las credenciales de autorización a través de un EventSource.

Esto no pretende servir como un ejemplo de cómo usar la API; se armó muy rápidamente como prueba de concepto. Se necesitará más trabajo para garantizar la robustez, mejorar la compatibilidad con otros navegadores y mejorar el tiempo de ida y vuelta en las conversaciones.

Lo mejor para pedirle es "Cuéntame un cuento (final)".

