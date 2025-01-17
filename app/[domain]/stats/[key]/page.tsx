import { notFound } from "next/navigation";
import Stats from "#/ui/stats";
import { Suspense } from "react";
import { getLinkViaEdge } from "#/lib/planetscale";
import { constructMetadata } from "#/lib/utils";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { domain: string; key: string };
}) {
  const data = await getLinkViaEdge(params.domain, params.key);

  // if the link is explicitly private (publicStats === false)
  // or if the link doesn't exist in database (data === undefined) and is not a dub.sh link
  // (we need to exclude dub.sh public demo links here)
  if (data?.publicStats === 0 || (params.domain !== "dub.sh" && !data)) {
    return;
  }

  return constructMetadata({
    title: `Stats for ${params.domain}/${params.key} - Dub`,
    description: `Stats page for ${params.domain}/${params.key}${
      data?.url ? `, which redirects to ${data.url}` : ""
    }.`,
    image: `https://${params.domain}/api/og/stats?domain=${params.domain}&key=${params.key}`,
  });
}

export async function generateStaticParams() {
  return [
    {
      domain: "dub.sh",
      key: "github",
    },
  ];
}

export default async function StatsPage({
  params,
}: {
  params: { domain: string; key: string };
}) {
  const data = await getLinkViaEdge(params.domain, params.key);

  if (data?.publicStats === 0 || (params.domain !== "dub.sh" && !data)) {
    notFound();
  }

  return (
    <div className="bg-gray-50">
      <Suspense fallback={<div className="h-screen w-full bg-gray-50" />}>
        <Stats staticDomain={params.domain} />
      </Suspense>
    </div>
  );
}
