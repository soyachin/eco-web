---
title: "owl: complejidad, sublenguajes y decisiones de diseño para trama"
date: 2026-06-01
description: por qué trama descarta OWL Full en favor de OWL DL + SPIN para modelar sus vistas temáticas.
tags:
  - trama
  - learning
  - books
  - rdf
draft: false
---

## qué es owl

owl (_web ontology language_) es un lenguaje para definir **ontologías** sobre la web. una ontología es una descripción formal de un dominio: qué cosas existen, cómo se relacionan, qué propiedades tienen y qué restricciones se les aplican.

owl se sitúa en la cima de la pila de la web semántica:

```
RDF          →  triples de datos (sujeto - predicado - objeto)
RDFS         →  subclases, subpropiedades, dominios y rangos básicos
OWL          →  lógica mucho más expresiva encima de RDFS
```

lo que owl agrega sobre rdfs es sustancial: clases definidas por condiciones complejas, propiedades inversas, simétricas y transitivas, restricciones de cardinalidad, igualdad y desigualdad entre individuos, definición de nuevos datatypes, etc. un ejemplo concreto:

```turtle
:NobelLaureate owl:equivalentClass [
    owl:intersectionOf (
        foaf:Person
        [ owl:onProperty :hasWon ;
          owl:someValuesFrom :NobelPrize ]
    )
] .

# esto es owl dl valido!
```

esto dice: _"un Nobel Laureate es exactamente una persona que ha ganado al menos un Nobel Prize"_. un razonador puede usar esa definición para inferir automáticamente, dado un grafo de datos, quién pertenece a la clase `NobelLaureate`; sin que nadie lo haya declarado explícitamente.

esa capacidad de **inferencia automática** es el valor central de owl sobre rdfs, y también la raíz de sus problemas de complejidad.

---

## el problema de owl full

owl full es owl sin restricciones. permite que **todo sea todo**:

- una clase puede ser instancia de otra clase
- una propiedad puede tener propiedades
- no hay separación entre el nivel de datos (individuos) y el nivel de esquema (clases, propiedades)

esa flexibilidad se llama **meta-modelado**: el grafo puede hablar de sí mismo. es expresivamente completo, pero computacionalmente inmanejable. el problema central es el de **entailment**:

> _dadas dos ontologías $O_1$ y $O_2$, ¿$O_1$ implica lógicamente a $O_2$?_

es decir: ¿todo modelo que satisface $O_1$ también satisface $O_2$? esto equivale a preguntar si una conclusión se puede derivar de las premisas. en owl full bajo semántica rdf-based, este problema es **indecidible** (no existe ningún algoritmo que lo resuelva siempre y termine siempre).

la demostración de esa indecidibilidad se hace por **reducción**: si existiera un algoritmo $A$ que resolviera el entailment de owl full, se podría usar para resolver el _Domino Problem_ (un problema ya conocido como indecidible), lo cual es una contradicción. por lo tanto $A$ no puede existir.

en la práctica esto significa que cualquier razonador sobre owl full sin restricciones, en ciertos inputs, tendrá que elegir entre dos males: _no terminar nunca_ o _dar una respuesta incorrecta_.

---

## clases de complejidad

antes de ver los sublenguajes de owl, conviene entender qué significan las etiquetas de complejidad que los caracterizan. son categorías que describen cuántos recursos (tiempo o memoria) necesita un algoritmo para resolver un problema en el **peor caso**.

la jerarquía de más fácil a más difícil:

```
AC⁰  <  NLOGSPACE  <  PTIME  <  NP  <  EXPTIME  <  NEXPTIME  <  N2EXPTIME  <  N4EXPTIME
```

|clase|qué significa|ejemplo intuitivo|
|---|---|---|
|$\text{AC}^0$|circuitos paralelos de profundidad constante|casi instantáneo|
|$\text{NLOGSPACE}$|memoria $O(\log n)$|si el input tiene $10^6$ elementos, usas ~20 bits|
|$\text{PTIME}$|tiempo $O(n^k)$ para algún $k$ fijo|considerado "eficiente" en teoría|
|$\text{NP}$|verificar una solución es fácil, encontrarla puede no serlo|SAT, problema del viajante|
|$\text{EXPTIME}$|tiempo $O(2^n)$|empieza a ser inviable para inputs grandes|
|$\text{NEXPTIME}$|no determinista sobre tiempo exponencial|—|
|$\text{N2EXPTIME}$|tiempo $O(2^{2^n})$|para $n=10$: $2^{1024}$ pasos|
|$\text{N4EXPTIME}$|exponencial cuádruple|solo teóricamente decidible|

el sufijo **-c** (_complete_) indica que el problema es tan difícil como el problema más difícil dentro de esa clase — es un piso y un techo a la vez.

---

## los sublenguajes de owl

como owl full es indecidible, el estándar owl define perfiles que aplican restricciones progresivas para recuperar decidibilidad, cada uno orientado a un caso de uso distinto.

### owl dl

owl dl (_description logics_) aplica las restricciones mínimas necesarias para restaurar la decidibilidad: separa estrictamente clases, propiedades e individuos, prohibiendo el meta-modelado. una clase no puede ser simultáneamente un individuo; una propiedad no puede ser el sujeto de otra tripleta de datos.

```
complejidad (ontology satisfiability): N4EXPTIME-c
complejidad (query answering):         decidibilidad abierta (no se sabe)
```

es el perfil más expresivo dentro de los decidibles, pero $\text{N4EXPTIME}$ lo hace inviable para datos a escala. se usa cuando se necesita máxima expresividad con garantía de terminación, típicamente en contextos académicos o de verificación formal.

### owl el

owl el elimina la negación y la disyunción de clases. fue diseñado para ontologías **muy grandes** con taxonomías relativamente simples — el caso paradigmático es SNOMED CT, la ontología clínica con millones de conceptos usada en sistemas de salud globales.

```
complejidad (ontology satisfiability): PTIME-c
complejidad (query answering):         ∈ EXPTIME (data complexity: PTIME-c)
```

al eliminar las construcciones más costosas, el razonamiento sobre la jerarquía de clases cae a tiempo polinomial. se elige owl el cuando la escala importa más que la expresividad.

### owl ql

owl ql está diseñado para conectar ontologías con **bases de datos relacionales**. su característica central es que permite _query rewriting_: una consulta SPARQL sobre la ontología se reescribe automáticamente en SQL y se ejecuta sobre la base de datos subyacente, sin necesidad de materializar el grafo completo.

```
complejidad (ontology satisfiability): NLOGSPACE-c
complejidad (query answering):         data complexity AC⁰, combined NP-c
```

$\text{AC}^0$ en data complexity significa que, fija la ontología, responder consultas sobre los datos es prácticamente instantáneo. se elige owl ql cuando los datos viven en una base de datos relacional y se quiere agregar semántica ontológica sin migrar la infraestructura.

### owl rl

owl rl fue diseñado para ser implementable con **motores de reglas** tipo datalog. sus axiomas pueden traducirse directamente a reglas de la forma _si antecedente entonces consecuente_, lo que lo hace compatible con infraestructura de reglas existente.

```
complejidad (ontology satisfiability): PTIME-c
complejidad (query answering):         data complexity PTIME-c, combined NP-c
```

el razonamiento es _sound but incomplete_ sobre grafos rdf arbitrarios: puede haber conclusiones válidas que el motor no derive, pero nunca derivará conclusiones incorrectas. se elige owl rl cuando ya existe infraestructura de reglas o cuando los datos usan vocabulario owl sin restricción y se quiere razonamiento pragmático sobre ellos.

### resumen comparativo

| perfil   | sacrifica            | gana                                 | complejidad (combined O.S.) |
| -------- | -------------------- | ------------------------------------ | --------------------------- |
| owl full | nada                 | expresividad total                   | indecidible                 |
| owl dl   | meta-modelado        | decidibilidad completa               | $\text{N4EXPTIME}$-c        |
| owl el   | negación, disyunción | escalabilidad                        | $\text{PTIME}$-c            |
| owl ql   | expresividad         | integración con bd relacionales      | $\text{NLOGSPACE}$-c        |
| owl rl   | completitud          | compatibilidad con motores de reglas | $\text{PTIME}$-c            |

---

## el problema de los quipus en _trama_

en _trama_, un **quipu** es una vista temática del grafo de conocimiento: selecciona qué clases de nodo son visibles, qué predicados forman aristas, y cómo se agrupan los nodos visualmente. la analogía directa en bases de datos relacionales es una **vista sql**: una consulta guardada sobre el esquema, no parte del esquema mismo.

el diseño original modelaba los quipus como individuos owl con propiedades que apuntaban directamente a clases de la misma ontología:

```turtle
trama:includesClass a owl:ObjectProperty ;
    rdfs:domain trama:Quipu ;
    rdfs:range  owl:Class .          # ← problema

trama:quipuSocial trama:includesClass trama:Club .          # ← trama:Club usado como individuo
trama:quipuSocial trama:includesClass trama:OrganizacionEstudiantil .
```

el problema: `trama:Club` es una clase (nivel de esquema) y al mismo tiempo el objeto de una tripleta de datos (nivel de individuos). eso es exactamente meta-modelado (owl full).

los problemas concretos que eso genera con un razonador owl dl o superior:

1. **rechazo de la ontología**: razonadores como pellet o hermit validan el perfil antes de cargar. si detectan meta-modelado, rechazan la ontología con un error de perfil, sin llegar siquiera a razonar.
    
2. **inconsistencia por mezcla de niveles**: owl dl exige separación estricta. que `trama:Club` sea clase e individuo simultáneamente viola esa separación y puede producir inconsistencias que se propagan a todo el grafo.
    
3. **inferencias contaminadas**: un razonador owl full (que sí acepta meta-modelado) podría derivar que `trama:Club` es instancia de `owl:Thing`, que `owl:Class` tiene ciertas propiedades heredadas, etc. inferencias técnicamente válidas pero que ensucian el grafo y complican las queries sparql.
    

como _trama_ solo usa sparql en la práctica, ninguno de estos problemas se manifiesta: sparql no razona, solo lee triples. pero en un trabajo con rigor académico, donde la ontología debe ser validable con razonadores estándar y publicable, el meta-modelado es un defecto de diseño que hay que corregir.

---

## la solución: owl dl + spin

la solución correcta es reconocer que los quipus no son **conocimiento del dominio** sino **configuración del sistema**: pertenecen a una capa distinta y deben modelarse con herramientas distintas.

### separación de capas

```
trama-ontology.ttl   →  OWL DL limpio (clases, propiedades, individuos de UTEC)
trama-quipus.ttl     →  RDF puro + SPIN (vistas del sistema trama)
```

la ontología de dominio queda libre de meta-modelado y es validable con cualquier razonador owl dl. los quipus viven en un archivo separado que no pretende ser owl dl.

### qué es spin

**SPIN** (_sparql inferencing notation_) es un vocabulario w3c que permite representar queries sparql como rdf. en lugar de guardar las vistas como configuración en json o yaml, se guardan como triples rdf con semántica formal:

```turtle
@prefix spin: <http://spinrdf.org/spin#> .
@prefix sp:   <http://spinrdf.org/sp#> .

trama:QuipuSocial a trama:Quipu ;
    rdfs:label "Quipu Social" ;
    spin:query trama:QuipuSocialQuery .

trama:QuipuSocialQuery a sp:Select ;
    rdfs:comment "selecciona clubs y organizaciones estudiantiles con sus alianzas" ;
    sp:text """
        SELECT ?a ?b ?rel WHERE {
            ?a a ?tipoA .
            ?b a ?tipoB .
            ?a ?rel ?b .
            VALUES ?tipoA { trama:Club trama:OrganizacionEstudiantil }
            VALUES ?tipoB { trama:Club trama:OrganizacionEstudiantil }
            VALUES ?rel   { trama:alianzaCon }
        }
    """ .
```

el backend de fastapi lee ese triple, extrae el string sparql y lo ejecuta contra el grafo. desde el punto de vista del razonador owl, `trama:QuipuSocialQuery` es simplemente un individuo con un atributo literal — sin meta-modelado, sin mezcla de niveles.

#### por qué spin y no json

la pregunta natural es por qué no simplemente guardar las queries en un archivo `quipus.json`. la respuesta es semántica y académica:

- **spin es rdf**: los quipus quedan dentro del mismo ecosistema de la web semántica, navegables con sparql, enlazables con IRIs, describibles con metadatos estándar
- **spin es citable**: es un vocabulario w3c con especificación formal, lo que le da respaldo académico al diseño
- **spin es extensible**: se pueden agregar metadatos como `rdfs:comment`, `dcterms:creator`, `dcterms:created` directamente sobre cada query, sin salir de rdf
- **json no tiene semántica**: un archivo json es opaco para cualquier herramienta de la web semántica

#### comparación directa

|criterio|owl full (diseño original)|spin + owl dl (diseño nuevo)|
|---|---|---|
|validable con razonador|no|sí (ontología de dominio)|
|rigor académico|defecto de diseño conocido|patrón w3c citable|
|sparql funciona|sí|sí|
|escalabilidad|igual|igual|
|separación de concerns|no (dominio + config mezclados)|sí (capas separadas)|

