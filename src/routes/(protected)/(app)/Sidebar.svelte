<script lang="ts">
    import determineWording from "$lib/utils/determineWording";
    import { type Writable } from "svelte/store";

    let { visible }: { visible: Writable<boolean> } = $props();
</script>

{#snippet group(links: { url: string; text: string; icon: string }[], name?: string)}
    <div>
        {#if name}
            <p class="text-light mb-2 pl-3">{name}</p>
        {/if}

        <ul>
            {#each links as { url, text, icon }}
                <li>
                    <a class="navigation-primary" href={url} data-sveltekit-reload>
                        <img src={icon} alt={text} />
                        <span>{text}</span>
                    </a>
                </li>
            {/each}
        </ul>
    </div>
{/snippet}

<div
    class="relative min-w-fit space-y-10 bg-primary p-7 xl:w-[17.5%] 2xl:w-[15%]"
    style="display: {$visible ? 'block' : 'none'};"
>
    {@render group([
        { icon: "/icons/navigation/Home.svg", text: "Home", url: "/" },
        { icon: "/icons/navigation/Account.svg", text: "Account", url: "/account" },
    ])}

    {@render group(
        [
            {
                icon: "/icons/navigation/Stars.svg",
                text: determineWording("favorites"),
                url: "/my/favorites",
            },
            {
                icon: "/icons/navigation/Folder.svg",
                text: determineWording("folders"),
                url: "/my/folders",
            },
            {
                icon: "/icons/navigation/Document.svg",
                text: determineWording("sets"),
                url: "/my/sets",
            },
        ],
        "Your library"
    )}

    {@render group(
        [
            {
                icon: "/icons/navigation/FolderPlus.svg",
                text: determineWording("folder"),
                url: "/create/folder",
            },
            {
                icon: "/icons/navigation/DocumentPlus.svg",
                text: determineWording("set"),
                url: "/create/set",
            },
        ],
        "Create a new"
    )}

    <p class="text-dark absolute bottom-7 text-sm">Made for Savannah ❤️</p>
</div>
