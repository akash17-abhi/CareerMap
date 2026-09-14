import RoadmapFlow from "@/features/roadmap/components/RoadmapFlow";
import useRoadmapSetup from "@/features/roadmap/hooks/useRoadmapSetup";

function RoadmapPage() {
  const roadmapSetup = useRoadmapSetup();

  return <RoadmapFlow {...roadmapSetup} />;
}

export default RoadmapPage;
