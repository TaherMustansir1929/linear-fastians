import { Button } from "@/components/animate-ui/components/buttons/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { socialLinks } from "@/constants/data";

const members = [
  {
    src: "https://avatars.githubusercontent.com/u/138671354?v=4",
    name: "Zeo XD",
    role: "Founder",
    link: socialLinks.github,
  },
  {
    src: "#",
    name: "Incoming...",
    role: "Be a part of the team",
    link: socialLinks.discord,
  },
];

export default function TeamSection() {
  return (
    <section>
      <div className="bg-muted/50 py-24">
        <div className="@container mx-auto w-full max-w-5xl px-6">
          <div className="mb-12">
            <h2 className="text-foreground text-4xl font-semibold">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground my-4 text-balance text-lg">
              Meet our hardcore contributers who spend their valuable time to
              make this project a success. Become a part of this journey and
              let&apos;s make it even better!
            </p>
            <Button asChild variant="outline" className="pr-2">
              <Link href={socialLinks.discord}>
                Contact Us
                <ChevronRight className="opacity-50" />
              </Link>
            </Button>
          </div>

          <div className="@sm:grid-cols-2 @xl:grid-cols-3 grid gap-6 md:gap-y-10">
            {members.map((member, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr] items-center gap-3"
              >
                <Avatar className="rounded-(--radius) ring-foreground/10 size-10 border border-transparent shadow ring-1">
                  <AvatarImage src={member.src} alt={member.name} />
                  <AvatarFallback className="rounded-(--radius)">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <a
                    href={member.link}
                    target="_blank"
                    className="cursor-pointer hover:underline"
                  >
                    <span className="text-foreground font-medium">
                      {member.name}
                    </span>
                  </a>
                  <div className="text-muted-foreground text-sm">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
