// Banco de ítems de Evaluación Diagnóstica Inicial de ESPAÑOL (7.° Grado)
// Cubre las 4 competencias clave:
// 1. Reconocimiento de palabras y ortografía
// 2. Comprensión de oraciones y gramática
// 3. Comprensión lectora contextualizada a Panamá
// 4. Escritura y construcción sintáctica

export const diagnosticQuestions = [
  // --- COMPETENCIA 1: Reconocimiento de Palabras y Ortografía ---
  {
    id: 'diag-1',
    competency: 'vocabulario',
    competencyLabel: 'Vocabulario y Ortografía',
    prompt: '¿Cuál de las siguientes palabras está escrita con la ortografía correcta?',
    audioPrompt: 'Observa las tres opciones y selecciona la palabra que tiene la ortografía correcta.',
    options: ['hervir', 'herbir', 'erbir'],
    answer: 'hervir',
    explanation: 'Los verbos terminados en -vir se escriben con "v", como hervir y servir (excepto hervir y servir no llevan b).'
  },
  {
    id: 'diag-2',
    competency: 'vocabulario',
    competencyLabel: 'Vocabulario y Ortografía',
    prompt: 'Identifica el antónimo (significado opuesto) de la palabra "abundante":',
    audioPrompt: '¿Cuál es la palabra que significa lo contrario de abundante?',
    options: ['escaso', 'mucho', 'amplio'],
    answer: 'escaso',
    explanation: 'Escaso significa poco o limitado, lo contrario de abundante.'
  },
  {
    id: 'diag-3',
    competency: 'vocabulario',
    competencyLabel: 'Vocabulario y Ortografía',
    prompt: '¿Qué palabra completa la frase: "El águila harpía tiene un ___ muy desarrollado"?',
    audioPrompt: 'Selecciona la palabra adecuada para completar la oración sobre el ave nacional de Panamá.',
    options: ['vuelo', 'buelo', 'guelo'],
    answer: 'vuelo',
    explanation: 'La palabra "vuelo" proviene del verbo volar y se escribe con la letra v corta.'
  },

  // --- COMPETENCIA 2: Comprensión de Oraciones y Gramática ---
  {
    id: 'diag-4',
    competency: 'gramatica',
    competencyLabel: 'Gramática y Estructura Oracional',
    prompt: 'En la oración: "Los pescadores de Pedasí regresaron al amanecer", ¿cuál es el sujeto?',
    audioPrompt: 'En la oración: Los pescadores de Pedasí regresaron al amanecer, ¿cuál es el sujeto?',
    options: ['Los pescadores de Pedasí', 'regresaron al amanecer', 'Pedasí'],
    answer: 'Los pescadores de Pedasí',
    explanation: 'El sujeto indica quién o quiénes realizan la acción de regresar.'
  },
  {
    id: 'diag-5',
    competency: 'gramatica',
    competencyLabel: 'Gramática y Estructura Oracional',
    prompt: 'Elige la oración que presenta correcta concordancia de género y número:',
    audioPrompt: 'Elige la oración que tiene correcta concordancia entre sus palabras.',
    options: [
      'Las canoas veloces llegaron a la orilla.',
      'Las canoa veloz llegaron a la orilla.',
      'Los canoas veloces llegaron a la orilla.'
    ],
    answer: 'Las canoas veloces llegaron a la orilla.',
    explanation: 'El artículo "Las", el sustantivo "canoas" y el adjetivo "veloces" están todos en femenino y plural.'
  },
  {
    id: 'diag-6',
    competency: 'gramatica',
    competencyLabel: 'Gramática y Estructura Oracional',
    prompt: '¿Qué conector expresa una causa en la oración: "No cruzamos el río ___ la corriente estaba crecida"?',
    audioPrompt: '¿Qué conector completa la oración indicando causa o motivo?',
    options: ['porque', 'pero', 'aunque'],
    answer: 'porque',
    explanation: '"Porque" es un conector causal que explica la razón por la cual no cruzaron el río.'
  },

  // --- COMPETENCIA 3: Comprensión Lectora Contextualizada ---
  {
    id: 'diag-7',
    competency: 'comprension_lectora',
    competencyLabel: 'Comprensión Lectora',
    readingPassage: 'El árbol de Guayacán florece una sola vez al año durante la temporada seca en Panamá. Durante unos pocos días, todas sus hojas caen y se cubre completamente de un brillante color amarillo que ilumina las colinas de Darién y el Canal.',
    prompt: 'Según el texto, ¿en qué momento del año florece el Guayacán?',
    audioPrompt: 'Escucha el texto y responde: ¿en qué momento del año florece el árbol de Guayacán?',
    options: ['En la temporada seca', 'En la temporada lluviosa', 'Durante todo el año'],
    answer: 'En la temporada seca',
    explanation: 'El texto señala textualmente que florece una vez al año durante la temporada seca.'
  },
  {
    id: 'diag-8',
    competency: 'comprension_lectora',
    competencyLabel: 'Comprensión Lectora',
    readingPassage: 'Los emberá construyen sus viviendas, llamadas tambos, sobre pilotes de madera elevados del suelo. Esta estructura protege a las familias de las crecidas repentinas del río y evita la entrada de animales del bosque.',
    prompt: '¿Cuál es la función principal de elevar los tambos sobre pilotes?',
    audioPrompt: 'Según la lectura sobre los tambos, ¿por qué se construyen elevados sobre pilotes?',
    options: [
      'Protegerse de las crecidas del río y de animales',
      'Hacer que la casa sea más fresca únicamente',
      'Observar mejor las estrellas en la noche'
    ],
    answer: 'Protegerse de las crecidas del río y de animales',
    explanation: 'El texto indica expresamente que los pilotes protegen de las crecidas y de los animales del bosque.'
  },
  {
    id: 'diag-9',
    competency: 'comprension_lectora',
    competencyLabel: 'Comprensión Lectora',
    readingPassage: 'A pesar de que el cielo de la tarde se tornó oscuro y se escuchaban truenos a lo lejos en Boquete, Manuel decidió guardar la leña bajo techo antes de que cayeran las primeras gotas.',
    prompt: 'Se puede deducir (inferir) que Manuel actuó de manera:',
    audioPrompt: 'A partir de la lectura, ¿qué cualidad describe la acción de Manuel?',
    options: ['Prevenida y prudente', 'Despreocupada y lenta', 'Temerosa e indecisa'],
    answer: 'Prevenida y prudente',
    explanation: 'Manuel fue prevenido porque resguardó la leña a tiempo anticipándose a la lluvia.'
  },

  // --- COMPETENCIA 4: Escritura y Construcción Sintáctica ---
  {
    id: 'diag-10',
    competency: 'comprension_oral',
    competencyLabel: 'Comprensión Oral y Expresión',
    prompt: 'Escucha con atención el siguiente fragmento oral y responde la pregunta:',
    audioPrompt: 'Fragmento oral: Los abuelos contaban que el canto de la tulivieja se escuchaba cerca de los manantiales cristalinos cuando el pueblo dormía. Pregunta: ¿Cerca de qué lugar se escuchaba el canto según el relato?',
    options: ['De los manantiales cristalinos', 'De la plaza del mercado', 'En la cima de las montañas'],
    answer: 'De los manantiales cristalinos',
    explanation: 'El relato oral menciona con claridad los manantiales cristalinos.'
  },
  {
    id: 'diag-11',
    competency: 'gramatica',
    competencyLabel: 'Escritura y Construcción Oracional',
    prompt: 'Ordena mentalmente las palabras para formar una oración coherente: [estudiantes / los / biblioteca / leen / en / la]',
    audioPrompt: 'Ordena las palabras: estudiantes, los, biblioteca, leen, en, la. ¿Cuál es el orden correcto?',
    options: [
      'Los estudiantes leen en la biblioteca.',
      'En la biblioteca estudiantes leen los.',
      'Leen los estudiantes biblioteca la en.'
    ],
    answer: 'Los estudiantes leen en la biblioteca.',
    explanation: 'Sigue la estructura básica del español: Sujeto (Los estudiantes) + Verbo (leen) + Complemento circunstancial (en la biblioteca).'
  },
  {
    id: 'diag-12',
    competency: 'vocabulario',
    competencyLabel: 'Vocabulario y Ortografía',
    prompt: '¿Cuál de las siguientes palabras lleva tilde porque es esdrújula?',
    audioPrompt: 'Identifica cuál de las opciones es una palabra esdrújula y por lo tanto siempre lleva tilde.',
    options: ['cántaro', 'cancion', 'papel'],
    answer: 'cántaro',
    explanation: 'Cántaro tiene el acento en la antepenúltima sílaba (cán-ta-ro); todas las esdrújulas llevan tilde.'
  }
];
