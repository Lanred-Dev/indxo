<script lang="ts" module>
    export const WORDING = {
        creation: [
            `Lets create a new ${determineWording("set")}!`,
            "Get started by entering the basics below.",
        ],
        setup: [
            `Now its time to create some ${determineWording("cards")}.`,
            "Get started by entering some terms and definitions below.",
        ],
    };
</script>

<script lang="ts">
    import { FormRow, FormInput } from "$lib/components/Form";
    import determineWording from "$lib/utils/determineWording";

    let { stage }: { stage: "creation" | "setup" } = $props();
</script>

{#if stage === "creation"}
    <FormRow>
        <FormInput
            id="isPublic"
            label="Visiblity"
            type="checkbox"
            componentProps={{
                value: true,
                text: ["Public", "Private"],
                icons: ["/icons/general/Web.svg", "/icons/general/Lock.svg"],
            }}
        />

        <FormInput
            id="name"
            label="Name"
            type="text"
            componentProps={{ placeholder: "Yapping 101 final exam..." }}
        />

        <FormInput
            id="subject"
            label="Subject"
            type="text"
            componentProps={{ placeholder: "Math, English, ..." }}
        />
    </FormRow>

    <FormInput
        id="description"
        label="What is this study set for?"
        type="textarea"
        classes="h-40"
        componentProps={{ placeholder: "This study set is for my final exam..." }}
    />
{:else}
    <FormInput
        id="terms"
        type="editableList"
        componentProps={{
            addText: `Add ${determineWording("card")}`,
            startingItems: 3,
            isDraggable: true,
            properties: [
                {
                    id: "term",
                    type: "input",
                    placeholder: "Term",
                },
                {
                    id: "definition",
                    type: "textarea",
                    placeholder: "Definition",
                },
            ],
        }}
    />
{/if}
