import { auth } from "@/auth"
import { WithSideNav } from "@/components/SideNav"
import { TopNav } from "@/components/TopNav"
import { extractSlugs } from "@/lib/utils"

const Notes = async ({ params }: { params: Promise<{ slug?: string[] }> }) => {
  const awaitedParams = await params
  const slugs = extractSlugs(awaitedParams.slug)
  const session = await auth()

  return (
    <WithSideNav>
      <div className="grid grid-rows-[auto_1fr]">
        <TopNav params={awaitedParams.slug} />
        <div className="size-full">
          <p>Hi {session?.user.name}</p>
          <p>Workspace: {slugs.workspace}</p>
          <p>Page: {slugs.page}</p>
          <p>Note: {slugs.note}</p>
        </div>
      </div>
    </WithSideNav>
  )
}

export default Notes
