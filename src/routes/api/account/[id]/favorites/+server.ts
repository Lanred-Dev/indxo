import { error, json } from "@sveltejs/kit";
import idToDocument from "$lib/utils/idToDocument";
import type { User } from "$lib/database/documents/User";
import type { PublicSet, Set } from "$lib/database/documents/Set";
import type { Folder, PublicFolder } from "$lib/database/documents/Folder";

export async function GET({ params }) {
    const user: User | null = await idToDocument("users", params.id);

    if (!user) error(404, "User not found.");

    const favorites: (PublicSet | PublicFolder)[] = [];

    for (const [id, type] of user.favorites) {
        const document: Set | Folder = await idToDocument(`${type}s`, id);

        if (!document) {
            continue;
        }

        favorites.push(document as unknown as PublicSet | PublicFolder);
    }

    return json(favorites);
}
