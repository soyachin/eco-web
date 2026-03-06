<script lang="ts">
    import { onMount } from 'svelte';
    import ecomecanico from '../../lib/assets/ascii.ts'

    const title = "ecomecanico";
    const letters = title.split("");
    
    let fontLoaded = false;

    onMount(() => {
        document.fonts.load('1em "Syne Tactile"').then(() => {
            fontLoaded = true;
        });
    });
</script>


<article class="prose mx-auto py-8 flex flex-col items-center overflow-x-hidden">
    
    <h1 class="syne-tactile text-6xl md:text-8xl text-foreground mb-10 text-center lowercase border-none flex flex-wrap justify-center {fontLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700">
        {#each letters as letter, i}
            <span 
                class="wobble-letter inline-block" 
                style="animation-delay: {i * 0.1}s"
            >
                {letter === " " ? "\u00A0" : letter}
            </span>
        {/each}
    </h1>

    <p class="text-center max-w-prose px-6 leading-relaxed">
        ecomecanico es el proyecto personal que reune mi pasión por el arte y la ciencia. 
        este es un espacio donde comparto mis aficiones, descubrimientos y proyectos 
        relacionados con el arte, ciencia y tecnología. por ahora no hay mucho por aquí 
        pero espero que disfrutes tu estancia y encuentres algo útil.
    </p>

    <!-- <div class="whitespace-pre font-main"> -->
    <!--   {@html ecomecanico} -->
    <!---->
    <!-- </div> -->
</article>

<style>
    /* Definición de la fuente y animaciones */
    .syne-tactile {
        font-family: 'Syne Tactile', system-ui, cursive;
        line-height: 1.1;
        -webkit-font-smoothing: antialiased;
    }

    .wobble-letter {
        display: inline-block;
        /* will-change optimiza la animación para la GPU */
        will-change: transform;
        animation: wobble 2.5s ease-in-out infinite;
        transform-origin: center;
    }

    @keyframes wobble {
        0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
        }
        25% { 
            transform: translateY(-3px) rotate(-1.5deg) scale(1.03); 
        }
        50% { 
            transform: translateY(2px) rotate(2deg) scale(0.97); 
        }
        75% { 
            transform: translateY(-1.5px) rotate(-0.8deg) scale(1.01); 
        }
    }

    /* Limpieza de estilos de Tailwind Prose */
    :global(.prose h1) {
        margin: 0 0 2.5rem 0 !important;
        font-weight: 400 !important;
        color: inherit !important;
    }

    /* Evita scroll horizontal accidental */
    :global(body) {
        overflow-x: hidden;
    }
</style>
