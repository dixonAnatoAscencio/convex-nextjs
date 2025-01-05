import { v } from "convex/values";
import { internalAction, internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const rateLimiter = new RateLimiter(components.rateLimiter, {
    createNote: { kind: "fixed window", rate: 1, period: MINUTE },
});


//Mutation
export const createNote = mutation({
    args: {
        note: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Unauthorized")
        }

        await rateLimiter.limit(ctx, "createNote", { key: userId, throws: true })

        await ctx.db.insert("notes", {
            userId,
            note: args.note,
        })

        await ctx.scheduler.runAfter(0, internal.notes.createNoteFile,
            { note: args.note })
    },
})

export const createNoteFile = internalAction({
    args: {
        note: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.storage.store(new Blob([args.note]))
    }
})

//query
export const getNotes = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Unauthorized")
        }

        return await ctx.db.query("notes").withIndex("by_userId", (q) => q.eq("userId", userId)).collect()
    },
})

async function isNoteOwner(ctx: QueryCtx | MutationCtx, noteId: Id<"notes">) {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
        return null
    }

    const note = await ctx.db.get(noteId)
    if (!note || note.userId !== userId) {
        return null
    }

    return note

}


export const deleteNote = mutation({
    args: {
        noteId: v.id("notes"),
    },
    handler: async (ctx, args) => {
        console.log(`Attempting to delete note with ID: ${args.noteId}`);
        
        const note = await isNoteOwner(ctx, args.noteId);
        if (!note) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(note._id);
        console.log(`Note with ID: ${args.noteId} has been deleted`);
    }
});

//Internal mutation
export const deleteAll = internalMutation({
    args: {},
    handler: async (ctx, args) => {
        const notes = await ctx.db.query("notes").collect()
        await Promise.all(notes.map((note) => ctx.db.delete(note._id)))
    },
})