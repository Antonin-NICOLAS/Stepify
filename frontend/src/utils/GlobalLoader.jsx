import SVGLoader from "../components/Loader";

export default function GlobalLoader() {
  return (
    <div className="global-loader">
      <SVGLoader size={300} />
    </div>
  );
}