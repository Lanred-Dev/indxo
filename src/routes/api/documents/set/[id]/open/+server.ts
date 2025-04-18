import type { User } from "$lib/database/documents/User";
import { loadCollection } from "$lib/database/mongo";
import idToDocument from "$lib/utils/idToDocument";
import { error } from "@sveltejs/kit";
import { type Collection } from "mongodb";

const users: Collection<User> = loadCollection("accounts", "users");

export async function GET({ params, fetch, locals }) {
    if (!locals.session) error(401, "Unauthorized.");

    const response = await fetch(`/api/documents/set/${params.id}`);

    if (response.status !== 200) return error(403, "You do not have permission to view this set.");

    const user: User = await idToDocument("users", locals.user._id);
    // Remove the set from the openedSets array if it exists
    const openedSets = user.openedSets.filter((set) => {
        return set[0] !== params.id;
    });

    openedSets.push([params.id, Date.now()]);

    await users.updateOne(
        { _id: locals.user._id },
        {
            $set: {
                openedSets,
            },
        }
    );

    return new Response(null, {
        status: 204,
    });
}
