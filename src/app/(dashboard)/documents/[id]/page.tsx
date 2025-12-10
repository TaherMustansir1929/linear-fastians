import DocumentPageContent from "./DocumentPageContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentPageContent id={id} />;
}
