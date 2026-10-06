import { PageShell } from "@/components/PageShell";
import { Insights } from "@/components/Insights";
export const metadata = { title: "CADD learning guides" };
export default function InsightsPage() {
  return (
    <PageShell
      eyebrow="LEARNING GUIDES"
      title={
        <>
          Docking, ADMET
          <br />
          <em>and CADD basics.</em>
        </>
      }
      intro="Short explanations of the methods and software used in computational drug-design studies. Each guide includes references for further reading."
    >
      <Insights listing />
    </PageShell>
  );
}
