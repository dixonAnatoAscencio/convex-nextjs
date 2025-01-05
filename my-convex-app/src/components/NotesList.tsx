import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NotesList() {
  const notes = useQuery(api.notes.getNotes);
  const deleteNote = useMutation(api.notes.deleteNote);

  return (
    <div className="flex flex-wrap gap-4 p-4 ">
      {notes?.map((note) => (
        <div
          key={note._id}
          className="bg-white border border-blue-500 rounded-lg p-4 shadow-md w-1/3 box-border"
        >
          <p className="text-gray-800 text-base">{note.note}</p>

          <button
            onClick={() => deleteNote({ noteId: note._id })}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
