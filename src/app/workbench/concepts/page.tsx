import { AtlasShell } from "@/components/shared/app-shell";
import { ConceptShowcase } from "@/components/shared/concept-showcase";

export default function ConceptsIndexPage() {
  return (
    <AtlasShell
      description="The concept lab compares the same flagship learner surfaces across four deliberate visual systems before locking the final product direction."
      eyebrow="Concept Lab"
      mode="workbench"
      title="Compare Research Atelier, Mission Control, Museum of Ideas, and Industrial Schematic."
    >
      <ConceptShowcase />
    </AtlasShell>
  );
}
