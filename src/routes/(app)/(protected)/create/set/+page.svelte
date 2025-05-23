<script lang="ts">
    import { Form, FormInput, FormSubmit, FormRow } from "$lib/components/Form";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import determineWording from "$lib/utils/determineWording";

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

    let stage: "creation" | "setup" = $state.raw("creation");
    let documentID: string = $state.raw("");

    /**
     * This function is called after the form is submitted, it determines what to do next.
     *
     * @param status The status code of the response
     * @param data Meta data from the submission
     * @returns never
     */
    function afterSubmit(status: number, data: any) {
        if (status !== 201 && status !== 204) return location.reload();

        if (stage === "setup") {
            goto(`/set/${documentID}`);
        } else if (stage === "creation") {
            stage = "setup";
            documentID = data;
        }
    }
</script>

<svelte:head>
    <title>Create a {determineWording("set")}</title>
</svelte:head>

<div class="page-title">
    <h1 class="page-title">{WORDING[stage][0]}</h1>
    <p class="page-subtitle">{WORDING[stage][1]}</p>
</div>

<Form
    classes="w-full"
    method={stage === "creation" ? "POST" : "PUT"}
    endpoint={stage === "creation"
        ? `/api/documents/set/create`
        : `/api/documents/set/${documentID}/update`}
    {afterSubmit}
>
    {#if stage === "creation"}
        <FormRow>
            <FormInput
                id="isPublic"
                label="Visiblity"
                type="checkbox"
                properties={{
                    value: true,
                    states: {
                        true: {
                            text: "Public",
                            icon: "/icons/general/Web.svg",
                        },
                        false: {
                            text: "Private",
                            icon: "/icons/general/Lock.svg",
                        },
                    },
                }}
            />

            <FormInput
                id="name"
                label="Name"
                type="text"
                properties={{ placeholder: "Yapping 101 final exam...", maxlength: 50 }}
            />

            <FormInput
                id="subject"
                label="Subject"
                type="text"
                properties={{ placeholder: "Math, English, ...", maxlength: 50 }}
            />
        </FormRow>

        <FormInput
            id="description"
            label="What is this study set for?"
            type="textarea"
            properties={{ placeholder: "This study set is for my final exam..." }}
        />
    {:else}
        <FormInput
            id="terms"
            type="editableList"
            properties={{
                isDraggable: true,
                properties: [
                    {
                        _id: "term",
                        type: "input",
                        placeholder: "Term",
                    },
                    {
                        _id: "definition",
                        type: "textarea",
                        placeholder: "Definition",
                    },
                ],
            }}
        />
    {/if}

    <FormSubmit text="Create" />
</Form>
