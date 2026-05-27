import ChatView from "@/components/ChatView";
import MetaPixel from "@/components/MetaPixel";
import { getFlow } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ChatSlugPage({ params }) {
  const { slug } = await params;
  const flow = await getFlow(slug);

  if (!flow) {
    return <div className="wa-screen wa-missing">No disponible</div>;
  }

  return (
    <>
      <MetaPixel pixelId={flow.pixelId} />
      <ChatView flow={flow} />
    </>
  );
}
