import { updatableFields, type Set } from "$lib/database/documents/Set";
import { loadCollection } from "$lib/database/mongo";
import generateRandomID from "$lib/utils/generateRandomID";
import permissionCheck from "$lib/utils/permissionCheck";
import { error } from "@sveltejs/kit";
import { type Collection } from "mongodb";

const sets: Collection<Set> = loadCollection("documents", "sets");

export async function PUT({ params, request, locals }) {
    if (!locals.session) error(401, "Unauthorized.");

    const set: Set | null = await sets.findOne({
        _id: params.id,
    });

    if (!set || !permissionCheck(set, locals.user._id, true))
        error(403, "You do not have permission to update this set.");

    const newFields: { [key: string]: any } = await request.json();
    const validFields: { [key: string]: any } = {};

    // Check if the new fields are valid
    for (const key in newFields) {
        if (
            !(key in updatableFields) ||
            (Array.isArray(newFields[key])
                ? updatableFields[key] !== "array"
                : updatableFields[key] !== typeof newFields[key]) ||
            (Array.isArray(newFields[key])
                ? JSON.stringify(newFields[key]) === JSON.stringify(set[key])
                : set[key] === newFields[key])
        )
            continue;

        validFields[key] = newFields[key];
    }

    if (validFields.length === 0)
        return new Response(null, {
            status: 204,
        });

    if ("terms" in validFields) {
        for (const term of validFields.terms) {
            // The length is checked to make sure its a valid ID
            if ("_id" in term || ("_id" in term && term._id.length !== 5)) continue;

            term._id = generateRandomID(5);
        }
    }

    await sets.updateOne(
        {
            _id: params.id,
        },
        {
            $set: validFields,
        }
    );

    return new Response(null, {
        status: 204,
    });
}
