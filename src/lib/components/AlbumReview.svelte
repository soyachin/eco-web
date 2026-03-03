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

<div class="album-card not-prose">
    <div class="cover-wrapper">
        <img src={cover} alt="{album} by {artist}" class="cover-image" />
    </div>
    <div class="info">
        <p class="album-title">{album}</p>
        <p class="artist-name">{artist}</p>
        <div class="rating-stars">
            {#each stars as active}
                <Star
                    size={18}
                    class="star {active ? 'active' : 'inactive'}"
                    fill={active ? "currentColor" : "none"}
                />
            {/each}
        </div>
    </div>
</div>

<style lang="postcss">
    @reference "../../app.css";

    .album-card {
        @apply flex items-center gap-6 p-6 rounded-2xl bg-background-soft/50 border border-border-subtle/20 my-8 backdrop-blur-md;
    }

    .cover-wrapper {
        @apply w-32 h-32 shrink-0 overflow-hidden rounded-lg shadow-xl;
    }

    .cover-image {
        @apply w-full h-full object-cover transition-transform duration-500 hover:scale-110;
    }

    .info {
        @apply flex-1 text-left flex flex-col p-0 justify-center;
    }

    .album-title {
        @apply text-xl;
    }

    .artist-name {
        @apply text-muted m-0;
    }

    .rating-stars {
        @apply flex gap-1 mt-3;
    }

    :global(.star) {
        @apply transition-colors duration-200;
        &.active {
            @apply text-yellow-500 fill-yellow-500;
        }
        &.inactive {
            @apply text-muted/20;
        }
    }
</style>
