<script lang="ts">
    import determineWording from "$lib/utils/determineWording";
    import { getContext, onMount } from "svelte";

    const sidebarVisible: { visible: boolean } = getContext("sidebarVisible");
    // NOTE: This is only used during the first load of the page to prevent the sidebar from flashing
    let isLoading: boolean = $state.raw(true);

    onMount(() => (isLoading = false));
</script>

{#snippet group(links: { url: string; text: string; icon: string }[], name?: string)}
    <div>
        {#if name}
            <p class="text-light mb-2 text-nowrap pl-3">{name}</p>
        {/if}

        <ul>
            {#each links as { url, text, icon }}
                <li>
                    <a class="button-navigation" href={url}>
                        <img src={icon} alt={text} />
                        <span>{text}</span>
                    </a>
                </li>
            {/each}
        </ul>
    </div>
{/snippet}

<div
    class="absolute left-0 top-0 z-50 h-full min-w-fit flex-col justify-between gap-10 overflow-y-auto overflow-x-hidden bg-primary py-7 pl-4 pr-16 md:static md:pl-7 md:pr-4 xl:w-[17.5%] 2xl:w-[15%] {isLoading
        ? 'pointer-events-none opacity-0'
        : ''}"
    style:display={sidebarVisible.visible ? "flex" : "none"}
>
    <nav class="min-w-fit space-y-10">
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
    </nav>

    <p class="text-dark pl-3 text-sm">Made for Savannah ❤️</p>
</div>
