"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useDocuments } from "@/hooks/useDocuments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  FileCode,
  FileType as FileTypeIcon,
  Calendar,
  Loader2,
} from "lucide-react";
import { User } from "@/types";

const getIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-10 w-10 text-red-500" />;
    case "md":
      return <FileCode className="h-10 w-10 text-blue-500" />;
    case "html":
      return <FileCode className="h-10 w-10 text-orange-500" />;
    case "latex":
      return (
        <div className="h-10 w-10 flex items-center justify-center font-bold text-green-600 border rounded">
          TeX
        </div>
      );
    default:
      return <FileTypeIcon className="h-10 w-10 text-gray-500" />;
  }
};

export default function UserProfileContent({ userId }: { userId: string }) {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await client.api.users[":id"].$get({ param: { id: userId } });
      if (!res.ok) return null;
      const data = await res.json();
      if ("error" in data) return null;
      return data as User;
    },
  });

  const { data: documents, isLoading: isDocsLoading } = useDocuments(userId);

  if (isUserLoading || isDocsLoading) {
    return (
      <div className="flex h-[50vh] justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userName = user?.fullName || "Student";
  const userAvatar = user?.avatarUrl;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 border-2">
          <AvatarImage src={userAvatar || ""} alt={userName || ""} />
          <AvatarFallback className="text-2xl">
            {userName?.[0] || "S"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{userName}</h1>
          <p className="text-muted-foreground">
            {documents?.length || 0} Documents Shared
          </p>
          {user?.role && (
            <Badge variant="outline" className="mt-2">
              {user.role}
            </Badge>
          )}
        </div>
      </div>

      {documents?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          This user hasn&apos;t shared any documents yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents?.map((doc) => (
            <Link href={`/documents/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    {getIcon(doc.fileType)}
                    <Badge variant="secondary" className="text-xs">
                      {doc.subject || "Gen"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
