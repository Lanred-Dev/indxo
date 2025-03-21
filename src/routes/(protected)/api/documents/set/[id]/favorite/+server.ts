import { json } from "@sveltejs/kit";
import toggleDocumentInFavorites from "$lib/utils/toggleDocumentInFavorites";

export async function GET({ params, locals }) {
    const [success, favorite] = await toggleDocumentInFavorites("set", params.id, locals.userID);

    return json({
        success,
        favorite,
    });
}
