import { useEffect, useMemo, useState } from "react";
import { FaGithub, FaStar, FaCodeBranch, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import { profile } from "../../data/projectsData";

const CACHE_KEY = "gh-repos-v2";
const CACHE_MS = 30 * 60 * 1000; // GitHub allows 60 unauthenticated calls/hour

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26", CSS: "#563d7c",
  C: "#555555", "C++": "#f34b7d", Shell: "#89e051", Java: "#b07219",
};

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && Date.now() - c.time < CACHE_MS) return c.repos;
  } catch {
    /* storage blocked */
  }
  return null;
}

function ago(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function useRepos() {
  const [repos, setRepos] = useState(readCache);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (repos) return;
    let cancelled = false;
    fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((data) => {
        const list = data
          .filter((r) => !r.fork)
          .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
          .map(({ id, name, description, language, stargazers_count, forks_count, html_url, homepage, pushed_at }) => ({
            id, name, description, language, stargazers_count, forks_count, html_url, homepage, pushed_at,
          }));
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), repos: list }));
        } catch {
          /* ignore */
        }
        if (!cancelled) setRepos(list);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [repos]);
  return { repos, error };
}

export default function ProjectsSection() {
  const { repos, error } = useRepos();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("All");

  const langs = useMemo(() => ["All", ...new Set((repos ?? []).map((r) => r.language).filter(Boolean))], [repos]);
  const shown = useMemo(
    () =>
      (repos ?? []).filter(
        (r) =>
          (lang === "All" || r.language === lang) &&
          (r.name + " " + (r.description ?? "")).toLowerCase().includes(query.trim().toLowerCase())
      ),
    [repos, lang, query]
  );

  if (error) {
    return (
      <div className="p-7 text-center space-y-3">
        <p className="text-slate-600">Couldn't reach GitHub right now.</p>
        <a href={profile.github} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold">
          <FaGithub /> Open my GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 space-y-4">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <label className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-fuchsia-300 select-text"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`h-10 px-3.5 rounded-xl text-sm whitespace-nowrap transition ${
                lang === l ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {!repos ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No projects match that.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {shown.map((r) => (
            <a
              key={r.id}
              href={r.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-fuchsia-300 hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 shrink-0">
                  <FaGithub />
                </span>
                <h4 className="font-semibold text-slate-900 leading-tight break-all pt-1.5">{r.name}</h4>
                <FaExternalLinkAlt className="ml-auto mt-2 text-xs text-slate-300 group-hover:text-fuchsia-500 shrink-0" />
              </div>
              <p className={`text-sm leading-snug line-clamp-2 min-h-[2lh] ${r.description ? "text-slate-600" : "text-slate-400 italic"}`}>
                {r.description || "No description yet"}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
                {r.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[r.language] || "#94a3b8" }} />
                    {r.language}
                  </span>
                )}
                <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> {r.stargazers_count}</span>
                <span className="flex items-center gap-1"><FaCodeBranch /> {r.forks_count}</span>
                <span className="ml-auto">{ago(r.pushed_at)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
