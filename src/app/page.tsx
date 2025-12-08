import { DocumentList } from "@/components/DocumentList";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
          Study Materials
        </h1>
        <p className="text-muted-foreground">
          Access and share exam prep resources for your upcoming finals.
        </p>
      </div>
      <DocumentList />
    </main>
  );
}
