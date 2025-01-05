import { useMutation } from "convex/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { api } from "../../convex/_generated/api";

export function NotesForm() {
    const createNote = useMutation(api.notes.createNote)

  return (
    <form onSubmit={(e) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const note = formData.get('note') as string
        void createNote({note})
        form.reset()
    }}>
      <Input name="note" />
      <div className="h-4" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
