import { json } from "@sveltejs/kit";
import { loadCollection } from "$lib/database/mongo";
import { ObjectId, type Collection } from "mongodb";
import type { Set } from "$lib/database/documents/Set";
import type { User } from "$lib/database/documents/User";

const users: Collection<User> = loadCollection("accounts", "users");
const sets: Collection<Set> = loadCollection("documents", "sets");

export async function POST({ request, locals }) {
    const {
        name,
        subject,
        description,
        isPublic,
    }: { name: string; subject: string; description: string; isPublic: boolean } =
        await request.json();
    const id: ObjectId = new ObjectId();

    await sets.insertOne({
        _id: id,
        name: name.length > 0 ? name : "Untitled",
        description: description.length > 0 ? description : "No description",
        subject,
        isPublic,
        terms: [],
        owner: locals.user._id,
        created: Date.now(),
        folder: [],
    });

    await users.updateOne(
        { _id: locals.user._id },
        {
            // For some reason a type error is thrown here, but it works fine
            // @ts-ignore
            $push: {
                sets: id,
            },
        }
    );

    return json(id, {
        status: 201,
    });
}
