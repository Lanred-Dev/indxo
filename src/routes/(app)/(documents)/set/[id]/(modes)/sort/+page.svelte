<script lang="ts">
    import type { Term } from "$lib/database/documents/Set";
    import { animate } from "motion";
    import { getContext } from "svelte";
    import StudyCard from "../../StudyCard.svelte";
    import Progress from "./Progress.svelte";
    import type { Session } from "$lib/database/documents/Session";
    import Controls from "../../Controls.svelte";
    import { beforeNavigate } from "$app/navigation";
    import { SvelteMap, SvelteSet } from "svelte/reactivity";
    import determineWording from "$lib/utils/determineWording";
    import { fade } from "svelte/transition";
    import type { SimplePrivateuser, SortingTerm } from "$lib/database/documents/User";

    const SORTING_MESSAGES: [number, string[]][] = [
        [0, ["You're still learning.", "You've got room to grow."]],
        [0.5, ["You know this.", "You're doing great."]],
        [1, ["Awesome!", "You're a genius."]],
    ];

    let { data } = $props();

    const session: Session = getContext("session");
    const { preferences }: SimplePrivateuser = getContext("user");

    // svelte-ignore non_reactive_update
    let card: HTMLDivElement;
    // svelte-ignore non_reactive_update
    let cardOverlay: HTMLDivElement;
    // svelte-ignore non_reactive_update
    let termCardComponent: StudyCard;
    let canCycle: boolean = $state.raw(true);
    let canFlip: boolean = $state.raw(true);

    let actualTerms: Term[] = $state.raw(
        data.set.terms.filter((term) => {
            const matchedTerm: SortingTerm | undefined = data.saved.find(
                ({ _id }) => _id === term._id
            );

            if (matchedTerm) {
                return !matchedTerm.sorted;
            } else {
                // If the term is not in the saved array, it means it is not sorted yet
                return true;
            }
        })
    );
    let currentTermIndex: number = $state.raw(0);
    let unsortedTerms: SvelteSet<string> = new SvelteSet(
        data.set.terms
            .filter((term) => {
                const matchedTerm: SortingTerm | undefined = data.saved.find(
                    ({ _id }) => _id === term._id
                );

                if (matchedTerm) {
                    return !matchedTerm.sorted;
                } else {
                    // If the term is not in the saved array, it means it is not sorted yet
                    return true;
                }
            })
            .map(({ _id }) => _id)
    );
    let stillLearningTerms: SvelteSet<string> = new SvelteSet(
        data.saved.filter(({ knows, sorted }) => !knows && sorted).map(({ _id }) => _id)
    );
    let knowTerms: SvelteSet<string> = new SvelteSet(
        data.saved.filter(({ knows, sorted }) => knows && sorted).map(({ _id }) => _id)
    );
    let struggling: SvelteMap<string, number> = data.saved.reduce((object, { _id, missed }) => {
        if (missed >= preferences.strugglingTermThreshold) {
            object.set(_id, missed);
        }

        return object;
    }, new SvelteMap<string, number>());

    let actualStrugglingTerms: string[] = $derived.by(() => {
        const actual: string[] = [];

        struggling.forEach((missed, id) => {
            if (missed < preferences.strugglingTermThreshold) return;

            actual.push(id);
        });

        return actual;
    });
    let resultsMessage: string = $derived.by(() => {
        if (unsortedTerms.size > 0) return "";

        let messages: string[] = [];

        SORTING_MESSAGES.forEach(([threshold, potentialMessages]) => {
            if (knowTerms.size / actualTerms.length < threshold) return;

            messages = potentialMessages;
        });

        return messages[(Math.random() * messages.length) | 0];
    });

    /**
     * Shuffle the terms in the set. Resets the current term to the first one.
     *
     * @returns never
     */
    function shuffle() {
        if (termCardComponent) termCardComponent.flipCard(false, false);

        currentTermIndex = 0;
        actualTerms.sort(() => Math.random() - 0.5);
    }

    /**
     * Restarts the study session by resetting all the state variables.
     *
     * @param withTerms The terms to study. Defaults to all terms in the set.
     * @param fullReset Whether to reset the knowTerms and stillLearningTerms arrays. Defaults to true.
     * @returns never
     */
    function restart(
        withTerms: string[] = data.set.terms.map(({ _id }) => _id),
        fullReset: boolean = true
    ) {
        canCycle = true;
        canFlip = true;
        currentTermIndex = 0;
        actualTerms = data.set.terms.filter(({ _id }) => withTerms.includes(_id));
        shuffle();

        unsortedTerms.clear();

        actualTerms.forEach(({ _id }) => {
            unsortedTerms.add(_id);
        });

        if (fullReset) {
            knowTerms.clear();
            stillLearningTerms.clear();
        }
    }

    /**
     * Handles the sorting of the terms. It will sort the terms into the knowTerms and stillLearningTerms arrays.
     *
     * @param direction The direction to sort the term in. -1 for still learning and 1 for know.
     * @returns never
     */
    async function cycle(knows: -1 | 1) {
        if (!canCycle) return;

        canCycle = false;
        canFlip = false;

        const id: string = actualTerms[currentTermIndex]._id;

        if (knows === 1) {
            knowTerms.add(id);
            struggling.set(id, 0);
        } else if (knows === -1) {
            stillLearningTerms.add(id);
            struggling.set(id, (struggling.get(id) ?? 0) + 1);
        }

        unsortedTerms.delete(id);

        // Apply a color overlay to the card to indicate the direction of the cycle and then animate it in
        cardOverlay.style.backgroundColor = knows === 1 ? "#4caf50" : "#f26a63";
        animate(
            cardOverlay,
            {
                opacity: [0, 0.3],
            },
            {
                duration: 0.2,
                ease: "easeInOut",
            }
        );

        await animate(
            card,
            {
                opacity: [1, 0],
                translate: ["0%", knows === 1 ? "8%" : "-8%"],
            },
            {
                duration: 0.3,
                ease: "easeInOut",
            }
        );

        canCycle = unsortedTerms.size > 0;

        if (canCycle) {
            canFlip = true;
            termCardComponent.flipCard(false, false);

            cardOverlay.style.opacity = "0";
            animate(
                card,
                {
                    opacity: [0, 1],
                    rotateX: [0, 0],
                    translate: ["0%", "0%"],
                },
                {
                    duration: 0.3,
                    ease: "easeInOut",
                }
            );
        } else {
            return; // `canCycle` will be false if there are no more unsorted terms
        }

        // If we are not at the end of the sorting then we need to show the next term
        const alreadySortedNextTerm: boolean = !unsortedTerms.has(
            actualTerms[currentTermIndex + 1]?._id
        );

        if (currentTermIndex + 1 < actualTerms.length - 1 && !alreadySortedNextTerm) {
            currentTermIndex++;
        } else if (alreadySortedNextTerm || unsortedTerms.size > 0) {
            currentTermIndex = actualTerms.findIndex(
                ({ _id }) => _id === unsortedTerms.values().next().value
            );
        }
    }

    beforeNavigate(async () => {
        if (session === null) return;

        data.saved = [];

        knowTerms.forEach((_id) => {
            data.saved.push({
                _id,
                knows: true,
                missed: struggling.get(_id) ?? 0,
                sorted: true,
            });
        });

        stillLearningTerms.forEach((_id) => {
            data.saved.push({
                _id,
                knows: false,
                missed: struggling.get(_id) ?? 0,
                sorted: true,
            });
        });

        unsortedTerms.forEach((_id) => {
            data.saved.push({
                _id,
                knows: false,
                missed: struggling.get(_id) ?? 0,
                sorted: false,
            });
        });

        await fetch(`/api/documents/set/${data.set._id}/sorting/update`, {
            method: "POST",
            body: JSON.stringify(data.saved),
        });
    });
</script>

{#if unsortedTerms.size === 0}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
        <div>
            <p class="text-4xl leading-none font-bold">{resultsMessage}</p>
            <p class="text-lg">Heres how you did.</p>
        </div>

        <div class="flex-center w-full gap-4">
            <div class="w-3/5">
                <div class="text-lg">
                    <p>
                        You are still learning <span class="text-alert font-bold"
                            >{stillLearningTerms.size}</span
                        >
                        {determineWording("terms")}
                    </p>

                    <p>
                        You know <span class="font-bold text-green-500">{knowTerms.size}</span>
                        {determineWording("terms")}
                    </p>
                </div>
            </div>

            <div class="flex-center grow flex-col gap-4 [&>button]:w-full">
                <button
                    class="button-attention"
                    onclick={() => {
                        restart(Array.from(stillLearningTerms.values()), false);

                        stillLearningTerms.clear();
                    }}
                    disabled={stillLearningTerms.size === 0}
                    >Study {stillLearningTerms.size > 0 ? stillLearningTerms.size : ""} still learning</button
                >

                <button
                    class="button-primary"
                    onclick={() => {
                        actualStrugglingTerms.forEach((id) => {
                            stillLearningTerms.delete(id);
                            knowTerms.delete(id);
                        });

                        restart(actualStrugglingTerms, false);
                    }}
                    disabled={actualStrugglingTerms.length === 0}
                    >Study {actualStrugglingTerms.length > 0 ? actualStrugglingTerms.length : ""} struggling
                    {determineWording("terms")}</button
                >

                <div class="flex w-full items-center justify-between px-[20%]">
                    <button
                        class="text-lg"
                        onclick={() => {
                            actualTerms.forEach(({ _id }) => {
                                stillLearningTerms.delete(_id);
                                knowTerms.delete(_id);
                            });

                            restart(
                                actualTerms.map(({ _id }) => _id),
                                false
                            );
                        }}>Restart</button
                    >

                    <button class="text-lg" onclick={() => restart()}>Start fresh</button>
                </div>
            </div>
        </div>
    </div>
{:else}
    <Progress
        stillLearning={stillLearningTerms.size}
        knows={knowTerms.size}
        terms={data.set.terms.length}
    />

    <StudyCard
        term={actualTerms[currentTermIndex]?.term}
        definition={actualTerms[currentTermIndex]?.definition}
        bind:card
        bind:canCycle
        bind:canFlip
        bind:this={termCardComponent}
    >
        {#snippet overlay()}
            <div
                class="rounded-container absolute top-0 left-0 z-[5] h-full w-full opacity-0"
                bind:this={cardOverlay}
            ></div>
        {/snippet}
    </StudyCard>

    <Controls
        {cycle}
        progress={[actualTerms.length, currentTermIndex + 1]}
        cycleButtons={{
            "-1": {
                icon: "/icons/general/X.svg",
                text: "Still learning",
                disabled: unsortedTerms.size === 0,
            },
            "1": {
                icon: "/icons/general/Check.svg",
                text: "Know",
                disabled: unsortedTerms.size === 0,
            },
        }}
    />
{/if}
