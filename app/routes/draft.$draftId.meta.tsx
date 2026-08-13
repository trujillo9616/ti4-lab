import { LoaderFunctionArgs, data } from "react-router";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const draftId = params.draftId;
  if (!draftId) {
    throw new Response("Draft ID required", { status: 400 });
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  const draft = JSON.parse(result.data as string) as Draft;

  // Format draft type display name
  const draftType = draft.settings?.type || "Unknown";
  const playerCount = draft.players?.length || 0;
  const draftTypeDisplay = formatDraftType(draftType, playerCount);

  // Image URL (either from CDN or the .png route that will generate it)
  const imageUrl = result.imageUrl || `https://tidraft.com/draft/${draftId}.png`;

  return data({
    title: `${draftId} - TI4 Lab`,
    description: `${draftTypeDisplay} on TI4 Lab`,
    image: imageUrl,
    url: `https://tidraft.com/draft/${draftId}`,
    type: "website",
    siteName: "TI4 Lab",
  });
};

function formatDraftType(type: string, playerCount: number): string {
  let baseName = type;

  if (type.startsWith("miltyeq")) {
    baseName = type.includes("hyperlane")
      ? "Milty Equidistant Hyperlane Draft"
      : "Milty Equidistant Draft";
  } else if (type.startsWith("heisen")) {
    baseName = type.includes("hyperlane")
      ? "Nucleus Hyperlane Draft"
      : "Nucleus Draft";
  } else if (type.startsWith("milty")) {
    baseName = type.includes("hyperlane")
      ? "Milty Hyperlane Draft"
      : "Milty Draft";
  } else if (type === "prechoice") {
    baseName = "Pre-Choice Draft";
  } else if (type === "raw") {
    baseName = "Raw Draft";
  }

  return `${baseName} (${playerCount} players)`;
}
