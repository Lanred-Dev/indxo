<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let {
        placeholder,
        classes,
        text,
        icons = ["/icons/general/Check.svg", "/icons/general/X.svg"],
    }: {
        placeholder?: boolean;
        classes?: string;
        icons?: [string, string];
        text?: [string, string];
    } = $props();

    let currentValue: boolean = $state(placeholder || false);
</script>

<div class={twMerge("checkbox relative", classes)} data-value={currentValue}>
    <button
        class="input-primary flex-center gap-1 {!text ? '!p-2' : ''}"
        onclick={() => (currentValue = !currentValue)}
        type="button"
    >
        <img
            class="size-7"
            src={currentValue ? icons[0] : icons[1]}
            alt={currentValue ? "True" : "False"}
        />

        {#if text}
            <p class="select-none">{currentValue ? text[0] : text[1]}</p>
        {/if}
    </button>
</div>
