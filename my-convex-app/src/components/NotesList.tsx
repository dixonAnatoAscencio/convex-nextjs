import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NotesList() {
  const notes = useQuery(api.notes.getNotes);

  return (
    <div className="div">
      {notes?.map((note) => <div key={note._id}>{note.note}</div>)}
    </div>
  );
}
