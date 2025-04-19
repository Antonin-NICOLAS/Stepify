import { useLoaderStore } from "../store/Loading"
import SVGLoader from "../components/Loader"

export default function GlobalLoader() {
  const { isLoading } = useLoaderStore()

  if (!isLoading) return null

  return (
    <>
      <div className="global-loader">
        <SVGLoader size={300}/>
      </div>
    </>
  )
}