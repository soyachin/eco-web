---
title: "la web actual y la web semántica"
date: 2026-05-29
description: introdución de web of data de aidan hogan
tags:
  - trama
  - learning
  - books
  - rdf
draft: false
---
## the current web
#### hypertext markup language (html)
los documentos html usan una *sintaxis, modelo y semánticas* para comunicar instrucciones a máquinas, transmitiendo la intención del autor de como quiere que se vea la página en un navegador en el lado del cliente.

1. la sintáxis: incluye símbolos de mayor/menor y *slashes* para indicar **tags** ( como `<title><title/>`) que no son parte del contenido primario. una máquina las puede identificarlas en el cuerpo del documento para usarlos y partirlo en difererentes partes.
2. el modelo: es basado en el árbol, permitiendo que los elementos sean anidados, que existan conceptos como tags hijos/ancestro.
3. [[semántica en computer science|la semántica]]: está *hard-codeada* en una especificación para desarolladores que deben seguir la cual indica que el tag `<title>` es usado para indicar el título del documento que debe ser mostrada en la ventana o *tab-bar* del navegador. lo mismo ocurre con el tag `<img>` se usa en el cuerpo de un documento paea indicar la ubicación de una imagen que la aplicación debería traer y mostrar en esa ubicación del cuerpo.

como el contenido de la web es **descentralizado** los ***links*** son de fundamental importancia para recomendar, conectar, ubicar y traversar en páginas web *ad hoc*, tejiando documentos html en una *web* (red).

de esta forma, los documentos html son legibles por la máquina pero en un sentido limitado: la máquina puede interpretar y actuar sobre el contenido de estos documentos, *pero solo para mostrar el documento y soportar la red de sus links*.

## the web of data 

## resource definition framework (rdf)
como el nombre sugiere es un framework estándar para describir recursos. los recursos son cualrquier cosa que uno consideraría describir en data, incluyendo entidades virtuales como páginas web, archivos de escritorio; entidades concretas como libros, personas, lugares; entidades abstractas como categorías, especies animales, puntos en el tiempo; etc. 

para **describir** recursos se utilizan términos rdf o rdf terms. hay tres tipos: IRIs, literales y nodos vacíos.

### IRIs (internationalised resource identifiers):
cuando queremos nombrar cosas en el habla común nos basta con usar strings simples como $Boston$. sin embargo, los strings pueden estar sujetos a ambigüedades: $Boston$ puede ser utilizado para referirse a la ciudad de EEUU, una banda de rock, una raza de perro y más. si en la web alguien indica que el recurso $Boston$ tiene una $población$ de $646000$ y alguien más indica que el recurso $Boston$ tiene como vocalista $\text{Brad Delp}$, combinar ambas fuentes de información sobre el recurso $Boston$ resultaría en consecuencias extrañas. por eso mismo, cuando deseamos identificar recursos en rdf se reusa el esquema global de nombres en la web. de esta forma la web podría utilizar dos IRIs diferentes para identificar a Boston (la ciudad) y Boston (banda de rock).

cuando los publishers utilizan diferentes IRIs para identificar el mismo recurso nos referimos a esas IRIs como correferentes.

```turtle
dbpedia:Lima 
wikidata:Q2868 # ambos identifican la misma ciudad
```

como la web está poco coordinada no es solo difícil e inviable que todos se pongan de acuerdo en un solo esquema de nombramiento para todos los recursos posibles. por ello, rdf no asume que hay un solo nombre para todo (UNA) y que varios IRIs pueden referirse a un solo recurso.

finalmente, como las IRIs son largas, varias sintaxis usan prefijos como abreviación:

```Turtle
@prefix ex:     <http://data.example.org/city/> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .

# ex:Boston expande a http://data.example.org/city/Boston
ex:Boston rdfs:label "Boston"@en .

# ex:Galway expande a http://data.example.org/city/Galway
ex:Galway rdfs:label "Galway"@en .
```

#### prefijos importantes

| prefijo | valor que referencia                          |
| ------- | --------------------------------------------- |
| rdf:    | <http://www.w3.org/1999/02/22-rdf-syntax-ns#> |
| xsd:    | <http://www.w3.org/2001/XMLSchema#>           |
| rdfs:   | <http://www.w3.org/2000/01/rdf-schema#>       |
| owl:    | <http://www.w3.org/2002/07/owl#>              |

### literales
si solo hubiesen IRIs en rdf no habría forma de proveer información legible como títulos, descripciones, fechas, valores numericos, etc. para resolver este problema rdf introduce los literales como términos: strings que pueden representar números, booleanos, fechas, etc.

en rdf 1.1 un literal puede consistir de 2 de 3 partes:
- la forma léxica: un string unicode
- un IRI datatype: indicando el *tipo* de literal
- un tag de lenguaje: indicando el lenguaje humano del texto.

```Turtle
# Forma léxica + IRI datatype (datatype literal)
# léxica: obligatoria | datatype IRI: obligatorio | language tag: no aplica
"25.00"^^xsd:decimal
"2024-01-01"^^xsd:date
"true"^^xsd:boolean

# Forma léxica + language tag (language-tagged string)
# léxica: obligatoria | datatype IRI: no aplica | language tag: obligatorio
"Lima"@es
"Lima"@en
"Lima"@fr

# Forma léxica sola (plain literal)
# léxica: obligatoria | datatype IRI: opcional (default xsd:string) | language tag: opcional
"Lima"
```

rdf asigna automaticamente algunos términos:

```turtle
"Lima"          → "Lima"^^xsd:string      # RDF asigna xsd:string por defecto
"Lima"@es       → "Lima"^^rdf:langString  # el @es asigna rdf:langString automáticamente
"25.00"^^xsd:decimal → se queda igual    # tú lo asignaste explícitamente
```

### blank nodes

los _blank nodes_ (nodos vacíos o anónimos) son términos rdf que no tienen IRI. se usan para representar recursos cuya identidad no importa o no se conoce puesto que solo importan sus propiedades y relaciones.

```turtle
# un blank node con sintaxis explícita
_:b1 rdf:type schema:Person ;
     schema:name "alguien" .

# sintaxis abreviada con corchetes (más común)
ex:Lima schema:location [
    rdf:type schema:GeoCoordinates ;
    schema:latitude "-12.04"^^xsd:decimal ;
    schema:longitude "-77.03"^^xsd:decimal
] .
```

los blank nodes tienen **alcance local**: dos documentos rdf distintos que usan `_:b1` no están hablando del mismo nodo. no son globalmente identificables como las IRIs, lo cual los hace útiles para estructuras auxiliares pero problemáticos para el _linking_ entre datasets.

### definiendo los términos rdf

> [!definition] RDF Terms
> Sea $\mathbf{I}$ el conjunto de IRIs, $\mathbf{L}$ el conjunto de RDF literals y $\mathbf{B}$ el conjunto de RDF blank nodes. Estos tres conjuntos son **pairwise disjoint**: no comparten elementos. El conjunto de *RDF terms* se define como la unión de estos tres conjuntos: $\mathbf{I} \cup \mathbf{L} \cup \mathbf{B}$.
