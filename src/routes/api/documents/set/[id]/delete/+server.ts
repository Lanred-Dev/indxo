import type { Set } from "$lib/database/documents/Set";
import type { User } from "$lib/database/documents/User";
import { loadCollection } from "$lib/database/mongo";
import permissionCheck from "$lib/utils/permissionCheck";
import { error } from "@sveltejs/kit";
import { type Collection } from "mongodb";

const users: Collection<User> = loadCollection("accounts", "users");
const sets: Collection<Set> = loadCollection("documents", "sets");

export async function DELETE({ params, locals, fetch }) {
    if (!locals.session) error(401, "Unauthorized.");

    const set: Set = await (await fetch(`/api/documents/set/${params.id}`)).json();

    if (!permissionCheck(set, locals.user._id, true))
        error(403, "You do not have permission to delete this set.");

    await sets.deleteOne({
        _id: params.id,
    });

    await users.updateOne(
        { _id: locals.user._id },
        {
            // For some reason a type error is thrown here, but it works fine
            // @ts-ignore
            $pull: {
                sets: params.id,
            },
        }
    );

    return new Response(null, {
        status: 204,
    });
}
