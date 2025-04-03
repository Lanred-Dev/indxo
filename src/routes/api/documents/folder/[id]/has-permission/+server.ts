import permissionCheck from "$lib/utils/permissionCheck";
import { json } from "@sveltejs/kit";
import { type Folder } from "$lib/database/documents/Folder";
import { error } from "@sveltejs/kit";

export async function GET({ params, locals, fetch }) {
    if (!locals.session) error(401, "Unauthorized.");

    const folder: Folder = await (await fetch(`/api/documents/folder/${params.id}`)).json();
    return json(permissionCheck(folder, locals.user._id, true));
}
