import { auth } from "@/auth"

const Home = async () => {
  const session = await auth()

  return (
    <div>
      <p>{session?.user?.id}</p>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.email}</p>
      <p>{session?.user?.image}</p>
      <p>{session?.expires}</p>
    </div>
  )
}

export default Home
