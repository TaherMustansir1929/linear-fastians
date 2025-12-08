import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-24 px-4 bg-muted/10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">🍒 Cramberry</h1>
        <p className="text-muted-foreground">Prep for exams together.</p>
      </div>
      <SignIn />
    </div>
  );
}
