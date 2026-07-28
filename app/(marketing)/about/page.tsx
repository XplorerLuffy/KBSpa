import type { Metadata } from "next";
import { Award, Compass, Target } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getStaff } from "@/services/catalog.service";
import { getSettings } from "@/services/content.service";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story, mission and team behind Kuenphen Beauty Spa — serving guests since 2020.",
};

const CERTIFICATES = [
  "Certified Aesthetics Practice",
  "Licensed Massage Therapy",
  "Hygiene & Sanitation Compliant",
  "Professional Bridal Artistry",
];

export default async function AboutPage() {
  const [settings, team] = await Promise.all([getSettings(), getStaff()]);

  return (
    <>
      <PageHero
        eyebrow="Since 2020"
        title="About Kuenphen Beauty Spa"
        description={settings.tagline}
      />

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            {settings.about_story}
          </p>
        </FadeIn>
      </section>

      <section className="bg-cream-100 dark:bg-charcoal-800/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerList className="grid gap-6 md:grid-cols-2">
            <StaggerItem>
              <GlassPanel className="flex h-full flex-col gap-4 p-8">
                <span className="bg-gold-100 text-gold-700 flex size-12 items-center justify-center rounded-2xl">
                  <Target className="size-5" aria-hidden />
                </span>
                <h2 className="font-serif text-2xl font-medium">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {settings.about_mission}
                </p>
              </GlassPanel>
            </StaggerItem>
            <StaggerItem>
              <GlassPanel className="flex h-full flex-col gap-4 p-8">
                <span className="bg-olive-100 text-olive-700 flex size-12 items-center justify-center rounded-2xl">
                  <Compass className="size-5" aria-hidden />
                </span>
                <h2 className="font-serif text-2xl font-medium">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {settings.about_vision}
                </p>
              </GlassPanel>
            </StaggerItem>
          </StaggerList>
        </div>
      </section>

      {team.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The People"
            title="Meet our team"
            description="A small, senior team — you will see the same familiar faces each visit."
          />

          <StaggerList className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person) => (
              <StaggerItem key={person.id}>
                <Card className="flex h-full flex-col items-center gap-4 p-7 text-center">
                  <Avatar className="size-20">
                    {person.photo_url && <AvatarImage src={person.photo_url} alt="" />}
                    <AvatarFallback className="text-lg">
                      {initials(person.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-serif text-lg font-medium">
                      {person.full_name}
                    </h3>
                    {person.title && (
                      <p className="text-gold-700 dark:text-gold-300 text-xs font-medium tracking-wide uppercase">
                        {person.title}
                      </p>
                    )}
                  </div>
                  {person.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {person.bio}
                    </p>
                  )}
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      )}

      <section className="bg-olive-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            inverted
            eyebrow="Standards"
            title="Certifications & training"
          />
          <StaggerList className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CERTIFICATES.map((certificate) => (
              <StaggerItem key={certificate}>
                <div className="flex h-full items-center gap-3 rounded-2xl bg-white/8 p-6">
                  <Award className="text-gold-300 size-6 shrink-0" aria-hidden />
                  <span className="text-cream-100 text-sm font-medium">
                    {certificate}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>
    </>
  );
}
