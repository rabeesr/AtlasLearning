import { AtlasShell } from "@/components/shared/app-shell";
import { FlagshipDashboard } from "@/components/shared/flagship-surfaces";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const curriculum = await getCurriculumData();
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return (
    <AtlasShell
      description="The default learner-facing dashboard leans into Mission Control and Brainmap: dense state, visible network structure, and high-agency navigation."
      eyebrow="Dashboard"
      title="Mission Control for the learning campaign."
    >
      <FlagshipDashboard curriculum={curriculum} progress={progress} />
    </AtlasShell>
  );
}
