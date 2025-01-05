import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";

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

        return await ctx.db.query("notes").collect()
    },
})

//Internal mutation
export const deleteAll = internalMutation({
    args: {},
    handler: async (ctx, args) => {
        const notes = await ctx.db.query("notes").collect()
        await Promise.all(notes.map((note) => ctx.db.delete(note._id)))
    },
})