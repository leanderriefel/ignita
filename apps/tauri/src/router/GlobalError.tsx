import { redirect } from "react-router"

const GlobalError = () => {
  redirect("/")

  return (
    <div className="flex size-full items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Page Not Found</h1>
        <p className="text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  )
}

export default GlobalError
