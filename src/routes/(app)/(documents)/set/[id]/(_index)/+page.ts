import type { PublicSet } from "$lib/database/documents/Set";

export async function load({ fetch, params }) {
    const response = await fetch(`/api/documents/set/${params.id}`);

    if (response.status === 403)
        return {
            canView: false,
        };

    const set: PublicSet = await response.json();
    const savedSorting = await (await fetch(`/api/documents/set/${params.id}/sorting`)).json();
    const isFavorite: boolean = await (
        await fetch(`/api/documents/${params.id}/is-favorite`)
    ).json();
    const hasPermission: boolean = await (
        await fetch(`/api/documents/set/${params.id}/has-permission`)
    ).json();

    return {
        canView: true,
        set,
        savedSorting,
        isFavorite,
        hasPermission,
    };
}
