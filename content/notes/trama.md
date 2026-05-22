
---
title: trama
date: 2026-04-28
description: sistema de conocimiento interconectado.
tags:
  - trama
draft: true
---
la universidad a la que pertenecemos al ser una universidad nueva carece de comunidad estrecha e interconectada. cuando un estudiante nuevo ingresa, no sabe que clubes (diferente de una org. estudiantil) existen. no sabe cuáles colaboran entre si. no sabe qué docente asesora proyectos relacionados de su interés. no conoce más del plan estudiantil más allá de la currícula oficial: no tiene los sílabos, ni que cursos son relevantes fuera del plan de estudios principal, etc. ni tampoco sabe quién más está trabajando en algo parecido en algo que él o ella quiere hacer.

toda la información mencionada existe, pero vive fragmentada, desactualizada, en PDFs con links muertos, en grupos de WhatsApp y especialmente en el boca a boca. la comunidad y su información existe pero no la mantiene ni la hace más accesible nadie.

el resultado: la universidad existe, pero la comunidad hay que encontrarla sola; y la mayoría nunca la encuentra.

## una intuición de interconexión
obsidian cambió como muchas personas entendemos lo que es tomar notas y en sí organizar el conocimiento. lo particular de este software es que facilita el uso del método zettelkasten de forma digital. este método, desarrollado por el sociólogo niklas luhmann, sigue la intuición que se puede mejorar la eficiencia de nuestros pensamientos si los organizamos como conocimiento interconectado, no solo acumulado. 

el siguiente proyecto **trama** pretende seguir implementar esta intuición de conocimiento interconectado como filosofía central.  

## ¿qué es lo que queremos lograr?
para que el conocimiento que genera una generación no muera con ella: un sitio web donde toda la universidad se representa como un grafo vivo de conocimiento.

cada entidad universitaria es un nodo:
- clubes estudiantiles
- organizaciones estudiantiles
- docentes
- sílabos y recursos académicos
- proyectos y tesis
- estudiantes, opcional y anónimamente.

sin embargo: ¿qué pretendemos hacer con toda esta información? establecer las conexiones entre ellas. un club solo no viene solo por su presencia mera en el grafo: viene de cuántos otros clubes, cursos o personas lo referencian.

cada conexión es un arista en el grafo con un significado:
- este **club** colaboró con este otro en un evento.
- este **curso** usa contenido que lo cubre este club.
- este **docente** asesora proyectos en esta área.
- esta **tesis** conecta conocimientos de tres cursos distintos.

así, la información deja de ser fragmentada y deja de estar en el boca a boca.

### ¿y por qué no un listado?
un directorio es una lista y sirve para buscar cosas que **ya sabes que existen**. un grafo de conocimiento es un mapa y le deja al usuario explorar y descubrir cosas que no sabía que existían.

## ¿a quién le sirve esto?
**al estudiante nuevo**: que no conoce a nadie ni sabe qué existe en su universidad más allá de las clases.

**al estudiante activo**: que quiere saber qué clubes o personas trabajan en áreas cercanas a las suyas.

**al representante de un club**: que quiere visibilidad y conexión con otros clubes afines.

**al estudiante que hace una tesis**: que quiere descubrir qué docentes, cursos y proyectos previos son relevantes para su investigación.

> **a cualquiera que sienta que la universidad le está dando menos de lo que podría darle.**

## la biblia de diseño
**1. descubrimiento sobre búsqueda**: el valor no está en encontrar algo específico. está en encontrar algo que no sabías que existía o necesitabas.
**2. la comunidad es el motor**: la plataforma no puede depender de una entidad oficial que no actualiza nada. el contenido lo generan y mantienen los propios estudiantes y clubes.
**3. las conexiones son la prioridad**: en un directorio, una alianza entre clubes sería una nota al pie. en este proyecto, es parte central de la estructura.
**4. crecer sin romperse**: el grafo empieza pequeño — solo clubes — y crece orgánicamente añadiendo nuevos tipos de nodos. cada fase añade profundidad sin reemplazar lo anterior. (hint a cómo se desarrollará).
**5. abierto por defecto** (y FOSS): cualquiera puede leer y explorar sin registrarse. la fricción para consumir debe ser cero. ***capital zero***.

## qué hace a trama diferente
no es el primero en hacer un directorio de clubes ni el primero en usar grafos en la web.

lo que lo hace diferente es la **intención**: no es una herramienta de organización. es una afirmación de que el conocimiento universitario vale más cuando está conectado, y que esa conexión no debería depender de una entidad oficial que no tiene incentivos para mantenerla viva.

**es una plataforma hecha por estudiantes, para estudiantes, que entiende que la universidad es más que su plan de estudios oficial.**

---

## nota del autor:

este es un mini pitch para elaborar un proyecto generado por mi propio descontento a la problemática exhibida en el texto. se exhibe la filosofía e intención principal de "trama" y su "biblia de diseño". sin embargo he obviado preguntas importantes que creo que nos deberíamos hacer a razón del proyecto antes o durante de su ejecución; para mantener el pitch breve.

el nombre "trama" es el que estuve tanteando en estas horas, sirve de placeholder por el momento. no es definitivo e incluso se pueden aceptar otros nombres que sugieran la misma naturaleza: conexión, tejido, ...

el proyecto "trama" se planea en desarrollar en fases:
1. fase 1: clubes/orgs estudiantiles + alianzas (mvp)
2. fase 2: cursos + sílabos (podría incluirse material académico curado por la comunidad!)
3. fase 3: docentes
4. fase 4 proyectos + tesis
5. fase 5: estudiantes

cada fase añade nodos y como podrá usted intuir una nueva capa de complejidad. no solo porque se deben pensar en los requerimientos (técnico/arquitecturales) del proyecto si no por la brecha de conocimiento que se tiene. ¿qué tan rápido se puede obtener esta información? y, ¿es posible hacerlo? yo creo que sí lo será, pero es menester contar de la contribución de la comunidad y, si es posible, de la misma universidad *(lo veo un poco lejano, pero nada se pierde preguntando).*

por la primera fase "clubes y organizaciones" será plausiblemente la capa con información mas accesible con los contactos correctos, asi que tengo *fe* en que se podrá realizar "trama".

gracias por leer hasta aquí.








