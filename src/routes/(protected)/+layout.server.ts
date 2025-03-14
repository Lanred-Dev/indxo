import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    if (locals.session) return;

    throw redirect(307, "/login");
}
