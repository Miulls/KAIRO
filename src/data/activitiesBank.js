// Banco de Actividades Interactivas de ESPAÑOL (7.° Grado - Panamá)
// Implementa las 10 modalidades pedagógicas requeridas:
// 1. Escucha y selecciona
// 2. Imagen y palabra
// 3. Completa la oración
// 4. Ordena la oración
// 5. Comprende la lectura
// 6. Escucha y comprende
// 7. Encuentra el error
// 8. Construye una historia
// 9. Relaciona conceptos
// 10. Desafío de vocabulario

export const activitiesBank = [
  // --- ACTIVIDAD 1: Escucha y selecciona ---
  {
    id: 'act-1',
    type: 'listen_and_select',
    level: 'Inicial',
    competency: 'vocabulario',
    title: 'Escucha y selecciona la palabra',
    instruction: 'Presiona el botón de audio para escuchar la palabra panameña y selecciona la opción escrita correctamente.',
    targetWord: 'Tamborito',
    spokenAudio: 'Tamborito',
    options: ['Tamborito', 'Tamboritoo', 'Tanborito'],
    answer: 'Tamborito',
    tip: 'Antes de "b" siempre se escribe "m", por eso es Tamborito.'
  },

  // --- ACTIVIDAD 2: Imagen y palabra ---
  {
    id: 'act-2',
    type: 'image_and_word',
    level: 'Inicial',
    competency: 'vocabulario',
    title: 'Identifica el animal de la imagen',
    instruction: 'Observa la ilustración nítida de nuestra fauna panameña y selecciona la palabra correcta.',
    visualImageSrc: '/guacamaya.svg',
    visualDesc: 'Ave representativa de los bosques panameños con plumaje rojo escarlata, amarillo y azul.',
    options: ['Guacamaya', 'Colibrí', 'Perico'],
    answer: 'Guacamaya',
    tip: 'El ave de gran tamaño y plumaje rojo escarlata, amarillo y azul de las selvas de Darién y Coiba es la Guacamaya roja.'
  },

  // --- ACTIVIDAD 3: Completa la oración ---
  {
    id: 'act-3',
    type: 'fill_sentence',
    level: 'Intermedio',
    competency: 'gramatica',
    title: 'Completa la oración con sentido',
    instruction: 'Selecciona la palabra que completa la oración respetando la concordancia.',
    sentenceTemplate: 'Los barcos cruzan el Canal de Panamá con mucha ___.',
    options: ['precaución', 'precausión', 'precación'],
    answer: 'precaución',
    tip: 'Las palabras que terminan en -ción derivadas de verbos como precaver se escriben con "c".'
  },

  // --- ACTIVIDAD 4: Ordena la oración ---
  {
    id: 'act-4',
    type: 'order_sentence',
    level: 'Intermedio',
    competency: 'gramatica',
    title: 'Ordena la oración coherente',
    instruction: 'Haz clic en las palabras en el orden correcto para formar una oración con sentido lógico.',
    scrambledWords: ['El', 'jaguar', 'camina', 'silencioso', 'por', 'la', 'selva.'],
    correctOrder: ['El', 'jaguar', 'camina', 'silencioso', 'por', 'la', 'selva.'],
    answerText: 'El jaguar camina silencioso por la selva.',
    tip: 'Comienza con la mayúscula (El), luego el sujeto (jaguar) y su acción (camina).'
  },

  // --- ACTIVIDAD 5: Comprende la lectura ---
  {
    id: 'act-5',
    type: 'reading_comprehension',
    level: 'Avanzado',
    competency: 'comprension_lectora',
    title: 'Comprende el texto breve',
    instruction: 'Lee el texto sobre las Esferas de Piedra o escúchalo antes de responder la pregunta.',
    readingText: 'En el Golfo de Chiriquí y en la región fronteriza del sur, antiguos pobladores originarios tallaron esferas de piedra casi perfectas hace más de mil años. Los arqueólogos admiran la precisión con la que labraron rocas volcánicas duras sin herramientas de metal modernas.',
    question: '¿Qué asombra a los arqueólogos sobre las esferas de piedra?',
    options: [
      'La precisión de la talla sin herramientas modernas',
      'El material suave con el que se rompieron',
      'Que fueron halladas en el fondo del mar'
    ],
    answer: 'La precisión de la talla sin herramientas modernas',
    tip: 'El texto destaca que admiran la precisión con que labraron rocas duras sin herramientas de metal modernas.'
  },

  // --- ACTIVIDAD 6: Escucha y comprende ---
  {
    id: 'act-6',
    type: 'audio_comprehension',
    level: 'Intermedio',
    competency: 'comprension_oral',
    title: 'Escucha y comprende la narración oral',
    instruction: 'Presiona el botón de audio para escuchar la narración oral y responde la pregunta.',
    narrationText: 'Amanecía en la comarca Guna Yala. Olonigña subió a su cayuco para recolectar cocos frescos antes de que el sol del mediodía calentara los arrecifes.',
    question: '¿Qué herramienta o transporte utilizó Olonigña al amanecer?',
    options: ['Su cayuco', 'Un autobús', 'Un caballo'],
    answer: 'Su cayuco',
    tip: 'El relato oral menciona claramente que subió a su cayuco para recolectar cocos.'
  },

  // --- ACTIVIDAD 7: Encuentra el error ---
  {
    id: 'act-7',
    type: 'find_error',
    level: 'Avanzado',
    competency: 'vocabulario',
    title: 'Encuentra y corrige el error',
    instruction: 'Observa la oración e identifica la palabra que contiene un error ortográfico.',
    sentence: 'Los agricultores fueron a recojer el maíz cosechado en la chorrera.',
    errorWord: 'recojer',
    options: ['recojer', 'cosechado', 'fueron'],
    correctedWord: 'recoger',
    tip: 'Los verbos terminados en -ger y -gir se escriben con "g": recoger, proteger, dirigir.'
  },

  // --- ACTIVIDAD 8: Construye una historia ---
  {
    id: 'act-8',
    type: 'story_sequence',
    level: 'Intermedio',
    competency: 'comprension_lectora',
    title: 'Secuencia de una narración',
    instruction: 'Organiza las tres partes de la historia en el orden cronológico adecuado (Inicio, Nudo, Desenlace).',
    steps: [
      { id: 'step-1', text: 'Primero, los estudiantes de 7.° grado prepararon la tierra del huerto escolar.' },
      { id: 'step-2', text: 'Luego, regaron las semillas de tomate durante tres semanas.' },
      { id: 'step-3', text: 'Finalmente, cosecharon tomates rojos y sanos para la cocina escolar.' }
    ],
    correctSequence: ['step-1', 'step-2', 'step-3'],
    tip: 'Los conectores temporales te guían: "Primero...", "Luego...", "Finalmente...".'
  },

  // --- ACTIVIDAD 9: Relaciona conceptos ---
  {
    id: 'act-9',
    type: 'match_concepts',
    level: 'Avanzado',
    competency: 'vocabulario',
    title: 'Relaciona palabras con su sinónimo',
    instruction: 'Selecciona cuál es el sinónimo más adecuado para la palabra destacada: "La noche en el volcán Barú era gélida".',
    targetConcept: 'gélida',
    options: ['extremadamente fría', 'muy calurosa', 'ruidosa y clara'],
    answer: 'extremadamente fría',
    tip: 'Gélido significa con temperatura muy baja o helada.'
  },

  // --- ACTIVIDAD 10: Desafío de vocabulario ---
  {
    id: 'act-10',
    type: 'vocab_context',
    level: 'Avanzado',
    competency: 'vocabulario',
    title: 'Significado contextual',
    instruction: 'Lee la oración y deduce el significado de la palabra según el contexto panameño: "El arriero caminaba a paso firme con su cutarra por el sendero pedregoso".',
    targetWord: 'cutarra',
    options: [
      'Calzado tradicional de cuero hecho a mano',
      'Un sombrero de paja toquilla',
      'Una bolsa tejida de fibras vegetales'
    ],
    answer: 'Calzado tradicional de cuero hecho a mano',
    tip: 'La cutarra es la sandalia o calzado típico artesanal elaborado en cuero en el interior de Panamá.'
  }
];
