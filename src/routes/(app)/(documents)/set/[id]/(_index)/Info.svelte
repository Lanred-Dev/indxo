<script lang="ts">
    import type { PublicSet } from "$lib/database/documents/Set";
    import User from "../../../User.svelte";

    let { description, owner, created }: PublicSet = $props();
</script>

<div class="mt-20 mb-12 space-y-6">
    <User {owner} {created} />

    <p class="text-lg">{description}</p>
</div>
