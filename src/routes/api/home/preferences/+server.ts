import { error, json } from "@sveltejs/kit";
import idToDocument from "$lib/utils/idToDocument";
import type { User } from "$lib/database/documents/User";

export async function GET({ locals }) {
    if (!locals.session) error(401, "Unauthorized.");

    const user: User = await idToDocument("users", locals.user._id);
    return json(user.homeSectionPreferences);
}
