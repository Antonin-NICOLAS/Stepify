import { useLoadingState } from "../context/LoadingContext";
import SVGLoader from "../components/Loader";

export default function GlobalLoader() {
  const { isLoading } = useLoadingState();

  if (!isLoading) return null;

  return (
    <div className="global-loader">
      <SVGLoader size={300} />
    </div>
  );
}