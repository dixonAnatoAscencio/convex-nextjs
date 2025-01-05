//import { Chat } from "@/Chat/Chat";
//import { ChatIntro } from "@/Chat/ChatIntro";
import { Layout } from "@/Layout";
import { SignInForm } from "@/SignInForm";
import { UserMenu } from "@/components/UserMenu";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { NotesForm } from "./components/NotesForm";
import { NotesList } from "./components/NotesList";

export default function App() {
  const user = useQuery(api.users.viewer);
  return (
    <Layout
      menu={
        <Authenticated>
          <UserMenu>{user?.name ?? user?.email}</UserMenu>
        </Authenticated>
      }
    >
      <>
        <Authenticated>
          <div className="container mx-auto py-12">
          <NotesForm />
          <NotesList />
          </div>
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </>
    </Layout>
  );
}
