import UserProfileContent from "./UserProfileContent";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfile({ params }: ProfilePageProps) {
  const { userId } = await params;
  return <UserProfileContent userId={userId} />;
}
