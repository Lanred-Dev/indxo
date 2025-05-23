<script module lang="ts">
    export function getDropdownFormInputValue(inputContainer: HTMLElement): string {
        const dropdown: HTMLButtonElement = inputContainer.querySelector(
            ".DropdownInput"
        ) as HTMLButtonElement;
        return dropdown.getAttribute("data-value") ?? "";
    }
</script>

<script lang="ts">
    import { goto } from "$app/navigation";
    import determineTextWidth from "$lib/utils/determineTextWidth";
    import { onMount } from "svelte";
    import Popup from "../Popup.svelte";

    export type ItemProperties = {
        value: string;
        text?: string;
        image?: string;
        isLink?: boolean;
    };

    let {
        labelID,
        items = [],
        value: dropdownValue = $bindable(items[0]?.value),
    }: {
        labelID?: string;
        items?: ItemProperties[];
        value?: string;
    } = $props();

    const uid: string = $props.id();
    const dropdownID: string = `${uid}-dropdown`;

    let longestValueLength: number = $state.raw(0);
    let visible: boolean = $state.raw(false);
    let { text: currentText, image: currentImage }: ItemProperties = $derived(
        items.find(({ value }, index) => {
            if (typeof dropdownValue === "string" && dropdownValue.length > 0)
                return value === dropdownValue;

            return index === 0;
        }) ?? { value: "" }
    );

    onMount(async () => {
        longestValueLength = await determineTextWidth(
            items.reduce(
                (longest, { text = "" }) => (text.length > longest.length ? text : longest),
                ""
            ),
            "var(--text-lg)"
        );
    });
</script>

<button
    class="DropdownInput input-primary"
    data-value={dropdownValue}
    type="button"
    id={uid}
    aria-controls={dropdownID}
    aria-haspopup="listbox"
    aria-expanded={visible}
    aria-labelledby={labelID}
>
    {#if currentImage}
        <img class="size-7" src={currentImage} alt={currentText} />
    {/if}

    {#if currentText}
        <span class="text-left text-nowrap" style:width="{longestValueLength}px">{currentText}</span
        >
    {/if}

    <img
        class="size-4"
        src="/icons/general/{visible ? 'UpChevron' : 'DownChevron'}.svg"
        alt="Arrow {visible ? 'up' : 'down'}"
    />
</button>

<Popup bind:visible id={uid} classes="w-56 p-1!" alignment="left">
    <ul role="listbox" id={dropdownID}>
        {#each items as { isLink, value, text, image }}
            <li class="w-full">
                <button
                    class="button-navigation py-1!"
                    role="option"
                    type="button"
                    aria-selected={dropdownValue === value}
                    onclick={() => {
                        if (isLink) return goto(value);

                        dropdownValue = value;
                        visible = false;
                    }}
                >
                    {#if image}
                        <img src={image} alt={text} />
                    {/if}

                    {text}
                </button>
            </li>
        {/each}
    </ul>
</Popup>
