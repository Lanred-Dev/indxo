import { error } from "@sveltejs/kit";
import { loadCollection } from "$lib/database/mongo";
import { type Collection } from "mongodb";
import type { Folder } from "$lib/database/documents/Folder";
import type { User } from "$lib/database/documents/User";
import type { Set } from "$lib/database/documents/Set";
import permissionCheck from "$lib/utils/permissionCheck";

const users: Collection<User> = loadCollection("accounts", "users");
const folders: Collection<Folder> = loadCollection("documents", "folders");
const sets: Collection<Set> = loadCollection("documents", "sets");

export async function DELETE({ params, locals, fetch }) {
    if (!locals.session) error(401, "Unauthorized.");

    const folder: Folder = await (await fetch(`/api/documents/folder/${params.id}`)).json();

    if (!permissionCheck(folder, locals.user._id, true))
        error(403, "You do not have permission to delete this folder.");

    const id: string = crypto.randomUUID();

    await folders.deleteOne({
        _id: id,
    });

    await users.updateOne(
        { _id: locals.user._id },
        {
            // For some reason a type error is thrown here, but it works fine
            // @ts-ignore
            $pull: {
                folders: id,
            },
        }
    );

    // Also update all sets that are linked to the folder
    await sets.updateMany(
        { folder: id },
        {
            // For some reason a type error is thrown here, but it works fine
            // @ts-ignore
            $pull: {
                folder: id,
            },
        }
    );

    return new Response(null, {
        status: 204,
    });
}
