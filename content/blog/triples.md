---
title: "rdf triples: notas de lectura"
date: 2026-06-01
description: continuación de _web of data_, Aidan Hogan, 2020. sección 3.3.
tags:
  - trama
  - learning
  - books
  - rdf
draft: false
---

## triples

mientras los _rdf terms_ se usan para **identificar** recursos, los **rdf triples** se usan para **describir** recursos: para hacer declaraciones sobre ellos.

los triples están inspirados en una de las formas más simples de estructura de oración en lenguaje natural: las oraciones sujeto-verbo-objeto (_SVO_):

```
Lemon   contains   Citrus
sujeto    verbo    objeto
```

sin embargo, muchas veces una oración quiere expresar una relación más compleja entre sujeto y objeto que un simple verbo. en ese caso la relación se generaliza como un **predicado** (_SPO_):

```
Boston   has population   868,222
sujeto      predicado      objeto
```

de forma análoga, un **rdf triple** es una declaración simple compuesta de tres elementos ordenados: sujeto, predicado y objeto. pero como vimos antes, strings simples como `"Boston"` no son identificadores adecuados en rdf. en cambio, cada una de las tres posiciones del triple es ocupada por un _rdf term_:

```turtle
ex:Lemon              ex:contains      ex:Citrus
ex:Boston             ex:hasPopulation "646,000"^^xsd:integer
ex:VoynichManuscript  ex:hasAuthor     _:b              # autor desconocido → blank node
ex:Citrus             ex:containedIn   ex:Lemon         # inverso del primero
```

el cuarto triple tiene exactamente el mismo significado intencional que el primero, pero con sujeto y objeto invertidos. aunque el sujeto suele considerarse el "recurso primario" que se describe, esa distinción es frecuentemente arbitraria: se pueden definir **predicados inversos** que intercambian los roles mientras describen lo mismo.

---

## restricciones de posición

los _rdf terms_ no pueden aparecer en cualquier posición del triple. las restricciones son:

|posición|tipos permitidos|
|---|---|
|sujeto|IRI, blank node|
|predicado|IRI (solo)|
|objeto|IRI, blank node, literal|

dicho de otra forma:

- los **literales** solo pueden aparecer en posición de objeto
- los **blank nodes** solo pueden aparecer en sujeto u objeto
- las **IRIs** pueden aparecer en cualquier posición

estas restricciones responden a decisiones de diseño tomadas desde el inicio de rdf:

1. las relaciones deben estar siempre **nombradas**. un predicado sin IRI no tiene identidad global
2. un literal como `"has population"` refiere al string en sí mismo, no a una relación del mismo nombre — usarlo como predicado sería semánticamente incorrecto
3. los literales son considerados _recursos secundarios_ que no deberían ser el sujeto principal de descripciones rdf — decisión más controversial, que el grupo de trabajo de rdf 1.1 discutió relajar sin llegar a ninguna acción

> existe una definición no-normativa de **generalised triple** en el estándar que elimina estas restricciones, pero no forma parte del rdf oficial.

---

## definición formal

construyendo sobre la definición de _rdf terms_ (donde $\mathbf{I}$ es el conjunto de IRIs, $\mathbf{B}$ el de blank nodes y $\mathbf{L}$ el de literales), la definición formal de un triple es:

> [!definition] rdf triple 
> un rdf triple $t := (s, p, o)$ es cualquier elemento del conjunto $\mathbf{IB} \times \mathbf{I} \times \mathbf{IBL}$, donde $s \in \mathbf{IB}$ se llama sujeto, $p \in \mathbf{I}$ se llama predicado y $o \in \mathbf{IBL}$ se llama objeto.

donde $\mathbf{IBL}$ es notación abreviada para $\mathbf{I} \cup \mathbf{B} \cup \mathbf{L}$.

dicho sin notación de conjuntos: un triple $(s, p, o)$ es un rdf triple si y solo si $s$ es IRI o blank node, $p$ es IRI, y $o$ es IRI, blank node o literal.

esta definición conceptual es útil para hablar de rdf en términos matemáticos generales, sin depender de ninguna sintaxis concreta (turtle, n-triples, rdf/xml, etc.).

---

## aridad fija y por qué 3

el modelo de datos de rdf tiene **aridad fija de 3** — cada tupla tiene exactamente tres elementos. esto juega un rol importante en cómo datos rdf de distintas fuentes pueden combinarse: dos grafos con el mismo triple comparten exactamente esa declaración, sin ambigüedad sobre qué posición corresponde a qué.

una pregunta razonable es por qué rdf no se basó en pares (2-tuplas) o cuádruplas (4-tuplas). la respuesta concisa del libro:

> _3 es la aridad mínima necesaria para representar convenientemente información arbitraria usando conjuntos no ordenados._

con pares, no hay forma de distinguir el rol de cada elemento sin convenciones adicionales. con cuádruplas se gana expresividad pero se pierde la simplicidad que hace que grafos de distintas fuentes sean directamente combinables. el triple es el punto de equilibrio.

---

## vocabulario y modelado

### clases y propiedades

las descripciones rdf se componen de dos tipos conceptuales de alto nivel: **propiedades** y **clases**.

- las **propiedades** son las relaciones que se sostienen entre pares de recursos. términos que se usan principalmente en posición de predicado
- las **clases** son grupos de recursos con similitudes conceptuales, agrupan recursos del mismo tipo. un recurso puede ser miembro de múltiples clases. un miembro de una clase se llama _instancia_ de esa clase; la clase de un recurso se llama su _tipo_

rdf provee dos términos built-in para trabajar con clases y propiedades:

- `rdf:type` — propiedad para relacionar una instancia con su clase
- `rdf:Property` — la clase de todas las propiedades

```turtle
ex:Lemon      rdf:type  ex:Fruit .        # Lemon es instancia de Fruit
ex:contains   rdf:type  rdf:Property .    # contains es una propiedad
```

clases y propiedades proveen un **vocabulario de alto nivel**: un conjunto de rdf terms; para uso general en descripciones rdf. una sola propiedad o clase puede usarse para describir una cantidad arbitraria de instancias. los vocabularios pueden reutilizarse trivialmente entre fuentes rdf independientes. datasets que acuerdan en vocabularios son más integrables entre sí porque _hablan el mismo idioma_.

la semántica de clases y propiedades puede hacerse explícita usando estándares construidos encima de rdf (como rdfs y owl) donde se puede definir, por ejemplo, que `ex:contains` es la inversa de `ex:containedIn`, o que cualquier instancia de `ex:DessertRecipe` es también instancia de la clase más general `ex:Dessert`.

---

## en trama...

los triples son la unidad atómica de todo lo que trama almacena y consulta. la distinción clases/propiedades se ve directamente en la ontología:

```turtle
# clases — agrupan recursos del mismo tipo
trama:Club               rdf:type  owl:Class .

# propiedades — relaciones entre recursos
trama:alianzaCon         rdf:type  owl:SymmetricProperty .
trama:perteneceA         rdf:type  owl:ObjectProperty .

# instancias — recursos que pertenecen a una clase
trama:ACM_UTEC           rdf:type  trama:OrganizacionEstudiantil .
trama:IEEE_UTEC          rdf:type  trama:OrganizacionEstudiantil .
```

el hecho de que trama reuse vocabularios estándar (`foaf:`, `schema:`, `org:`) en lugar de definir todo bajo `trama:` es exactamente el principio de integración que menciona el libro: datasets que acuerdan en vocabularios son más integrables. un sistema externo que entiende `foaf:Person` ya sabe interpretar los docentes de trama sin documentación adicional.

```turtle
# un triple de trama: sujeto IRI, predicado IRI, objeto IRI
trama:ACM_UTEC  trama:alianzaCon  trama:IEEE_UTEC .

# sujeto IRI, predicado IRI, objeto literal
trama:ACM_UTEC  trama:area  "Especializada"^^xsd:string .

```

la restricción de que los literales solo aparecen en posición de objeto explica por qué en trama todas las propiedades de datos (`trama:area`, `trama:contacto`, `trama:ciclo`) tienen literales como objeto y nunca como sujeto. y la restricción de que el predicado solo puede ser IRI es la razón por la que cada propiedad de trama tiene su propio IRI bajo `https://trama.edu/ontology#`; no se pueden usar strings arbitrarios como relaciones.