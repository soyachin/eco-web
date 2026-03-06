<script lang="ts">
    import { Star } from "lucide-svelte";
    let { artist, album, cover, rating } = $props<{
        artist: string;
        album: string;
        cover: string;
        rating: number;
    }>();

    const stars = Array(5)
        .fill(0)
        .map((_, i) => i < rating);
</script>

<div class="not-prose my-8 flex items-center gap-6 p-6 rounded-2xl bg-background-soft/50 border border-border-subtle/20 backdrop-blur-md">
    <div class="w-32 h-32 shrink-0 overflow-hidden rounded-lg shadow-xl">
        <img 
            src={cover} 
            alt="{album} by {artist}" 
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
    </div>
    <div class="flex-1 text-left flex flex-col p-0 justify-center">
        <p class="text-xl">{album}</p>
        <p class="text-muted m-0">{artist}</p>
        <div class="flex gap-1 mt-3">
            {#each stars as active}
                <Star
                    size={18}
                    class="transition-colors duration-200 {active ? 'text-yellow-500 fill-yellow-500' : 'text-muted/20'}"
                    fill={active ? "currentColor" : "none"}
                />
            {/each}
        </div>
    </div>
</div>
