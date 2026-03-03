<script lang="ts">
    import { page } from "$app/state";
    import { Home, ArrowLeft, RefreshCcw, ShieldAlert } from "lucide-svelte";

    const status = page.status;
    const message = page.error?.message || "Something went wrong";

    const is404 = status === 404;
</script>

<svelte:head>
    <title>{status} - {is404 ? "Page Not Found" : "Error"}</title>
</svelte:head>

<div
    class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
>
    <h1 class="text-4xl font-bold mb-4 text-brand">
        {#if is404}
            página no encontrada
        {:else}
            Error {status}
        {/if}
    </h1>

    <p class="text-foreground/70 mb-8 max-w-md mx-auto">
        {#if is404}
            la ruta que buscas no existe o ha sido movida ToT
        {:else}
            {message}
        {/if}
    </p>

    <div class="flex flex-wrap gap-4 justify-center">
        <a
            href="/"
            class="flex items-center gap-2 px-6 py-2 bg-brand/5 hover:bg-brand/10 text-brand rounded-md transition-colors border border-brand/20"
        >
            <Home size={16} />
            <span>inicio</span>
        </a>

        <button
            on:click={() => history.back()}
            class="flex items-center gap-2 px-6 py-2 bg-background-soft hover:bg-background-soft/80 text-foreground/70 rounded-md transition-colors border border-border-subtle"
        >
            <ArrowLeft size={16} />
            <span>volver</span>
        </button>
    </div>

    <div class="mt-12 pt-6 border-t border-border-subtle/30 w-full max-w-xs">
        <p class="text-hint">
            Código: {status}
        </p>
    </div>
</div>
