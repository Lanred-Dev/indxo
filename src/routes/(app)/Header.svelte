<script lang="ts">
    import type { SimpleFolder } from "$lib/database/documents/Folder";
    import type { SimpleSet } from "$lib/database/documents/Set";
    import type { SimpleUser, SimplePrivateuser } from "$lib/database/documents/User";
    import determineDocumentType from "$lib/utils/determineDocumentType";
    import { goto } from "$app/navigation";
    import { getContext } from "svelte";
    import type { Session } from "$lib/database/documents/Session";
    import Popup from "$lib/components/Popup.svelte";
    import type { SidebarContext, SizesContext } from "./+layout.svelte";

    const session: Session | null = getContext("session");
    const user: SimplePrivateuser = getContext("user");
    const sidebar: SidebarContext = getContext("sidebar");
    const sizes: SizesContext = getContext("sizes");

    let searchQuery: string = $state.raw("");
    let searchResults: (SimpleUser | SimpleSet | SimpleFolder)[] = $state.raw([]);
</script>

<svelte:window
    onkeydown={(event: KeyboardEvent) => {
        if (
            event.key !== "Enter" ||
            searchQuery.length === 0 ||
            !(event.target as HTMLElement).closest("#searchBar")
        )
            return;

        (event.target as HTMLElement).blur();
        goto(`/search?query=${searchQuery}`);
    }}
/>

{#snippet searchResult({
    name,
    image,
    meta,
    link,
    nameIsHTML = false,
}: {
    name: string;
    image?: string;
    meta?: string;
    link?: string;
    nameIsHTML?: boolean;
})}
    <a class="flex items-center gap-1" href={link}>
        {#if image}
            <img class="size-6 {image ? 'rounded-full' : ''}" src={image} alt={name} />
        {/if}

        <div class="[&>p]:leading-tight">
            <p class="flex items-center justify-start text-nowrap">
                {#if nameIsHTML}
                    {@html name}
                {:else}
                    {name}
                {/if}
            </p>

            {#if meta}
                <p class="text-light line-clamp-1 text-sm">{meta}</p>
            {/if}
        </div>
    </a>
{/snippet}

<header
    class="fixed top-0 left-0 z-40 w-full px-2 pt-2 md:px-6 md:pt-4"
    bind:clientHeight={sizes.header}
>
    <div
        class="bg-attention-bright relative flex w-full items-center justify-between rounded-full px-2 py-2"
    >
        <div class="flex-center pl-3">
            {#if session}
                <button id="sidebarToggle" onclick={() => (sidebar.visible = !sidebar.visible)}>
                    <img
                        class="size-7"
                        src="/icons/navigation/Hamburger.svg"
                        alt="Sidebar toggle"
                    />
                </button>
            {/if}
        </div>

        <div class="input-primary x-center y-center w-[40vw] bg-white p-0 shadow-sm">
            <img class="y-center left-3 size-5" src="/icons/general/Search.svg" alt="Search" />

            <input
                id="searchBar"
                class="w-full border-0 bg-transparent py-2 pr-3 pl-10 outline-none focus:ring-0"
                placeholder="Looking for something?"
                autocomplete="off"
                bind:value={searchQuery}
                oninput={async () => {
                    // 3 is the minimum search query
                    if (searchQuery.length < 3) return (searchResults = []);

                    searchResults = await (
                        await fetch("/api/search", {
                            method: "POST",
                            body: JSON.stringify({
                                query: searchQuery,
                            }),
                        })
                    ).json();
                }}
            />
        </div>

        <Popup
            id="searchBar"
            classes="w-[40vw] space-y-3"
            alignment="center"
            canShow={searchQuery.length >= 3}
        >
            {#each searchResults as { name, ...properties }}
                {@render searchResult({
                    name,
                    link: `/${determineDocumentType(properties)}/${properties._id}`,
                    image:
                        "image" in properties
                            ? properties.image
                            : "icon" in properties
                              ? properties.icon
                              : undefined,
                    meta:
                        "description" in properties
                            ? (properties.description as string)
                            : "subject" in properties
                              ? (properties.subject as string)
                              : undefined,
                })}
            {/each}

            {@render searchResult({
                name: `Search "<span class="block w-full max-w-20 overflow-hidden text-ellipsis">${searchQuery.trim()}</span>" in Users`,
                image: "/icons/navigation/Account.svg",
                link: `/search?query=${searchQuery}&returnOnly=user`,
                nameIsHTML: true,
            })}

            {@render searchResult({
                name: `Search "<span class="block w-full max-w-20 overflow-hidden text-ellipsis">${searchQuery.trim()}</span>" in Sets`,
                image: "/icons/navigation/Document.svg",
                link: `/search?query=${searchQuery}&returnOnly=set`,
                nameIsHTML: true,
            })}

            {@render searchResult({
                name: `Search "<span class="block w-full max-w-20 overflow-hidden text-ellipsis">${searchQuery.trim()}</span>" in Folders`,
                image: "/icons/navigation/Folder.svg",
                link: `/search?query=${searchQuery}&returnOnly=folder`,
                nameIsHTML: true,
            })}
        </Popup>

        {#if session}
            <button id="accountInfoToggle">
                <img
                    class="border-primary size-10 rounded-full border"
                    src={user.image}
                    alt={user.name}
                />
            </button>

            <Popup id="accountInfoToggle" classes="space-y-1 px-1! pb-1!" alignment="right">
                <div class="flex-center w-full gap-2 px-3 pb-1">
                    <img
                        class="border-primary size-10 rounded-full border"
                        src={user.image}
                        alt={user.name}
                    />

                    <div class="space-y-0.5 [&>p]:leading-none">
                        <p class="text-lg font-bold">{user.name}</p>
                        <p>{user.email}</p>
                    </div>
                </div>

                <ul>
                    <li>
                        <a class="button-navigation" href="/settings">
                            <img src="/icons/navigation/Settings.svg" alt="Settings" />
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>

                <a class="button-navigation" href="/api/auth/logout">
                    <img src="/icons/navigation/LogOut.svg" alt="Log out" />
                    <span>Log out</span>
                </a>
            </Popup>
        {:else}
            <a class="button-primary" href="/login">
                <img class="size-5" src="/icons/navigation/Account.svg" alt="Login" />
                <span>Log in</span>
            </a>
        {/if}
    </div>
</header>
