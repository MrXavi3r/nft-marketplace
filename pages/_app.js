import "../styles/globals.css";
import Link from "next/link";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-stone-900 min-h-screen">
      <nav className="border-b border-pink-400 p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-4xl font-mono font-bold mr-4 text-transparent bg-clip-text bg-gradient-to-tr from-stone-200 to-zinc-100 shadow">
            Mueshi
          </p>
          <input
            type="text"
            className="rounded-2xl border-2 border-gray-300 p-2 h-8 text-black"
            placeholder="Search..."
          />
        </div>

        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-pink-500">Home</a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500">Sell An Asset</a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">My Assets</a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">Creator Dashboard</a>
          </Link>
        </div>
      </nav>

      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
