import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs()

crons.interval("clear notes table", { seconds: 1000}, internal.notes.deleteAll)

export default crons;