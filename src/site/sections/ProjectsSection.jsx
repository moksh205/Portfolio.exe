import { useEffect, useMemo, useState } from "react";
import { FaGithub, FaStar, FaCodeBranch, FaSearch, FaExternalLinkAlt, FaGlobe } from "react-icons/fa";
import { profile } from "../../data/projectsData";

const CACHE_KEY = "gh-repos-v4";
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

// The deployed site for a repo: its "website" field on GitHub, or its GitHub Pages URL
function liveUrl(r) {
  const home = (r.homepage || "").trim();
  if (home) return /^https?:\/\//.test(home) ? home : `https://${home}`;
  if (r.has_pages) return `https://${profile.githubUser.toLowerCase()}.github.io/${r.name}/`;
  return null;
}

const prettyHost = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// Live screenshot from microlink (free; used when no saved shot exists, e.g. a brand-new project)
const liveShot = (site) =>
  "https://api.microlink.io/?" +
  new URLSearchParams({
    url: site, screenshot: "true", meta: "false", embed: "screenshot.url",
    "viewport.width": "1280", "viewport.height": "800", "viewport.deviceScaleFactor": "0.5",
    "screenshot.type": "jpeg", waitForTimeout: "1500",
  });

// Picture of the live site, clickable. Tries the saved shot (npm run shots), then a live one, then a placeholder.
function SiteShot({ name, site }) {
  const sources = useMemo(() => [`/projects/${encodeURIComponent(name)}.jpg`, liveShot(site)], [name, site]);
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const failed = i >= sources.length;
  return (
    <a
      href={site}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name} live site (${prettyHost(site)})`}
      className="relative block -mx-4 -mt-4 mb-1 aspect-[16/10] overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-50 to-sky-50"
    >
      {!failed && (
        <img
          key={sources[i]}
          src={sources[i]}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setI((n) => n + 1);
          }}
          className={`w-full h-full object-cover object-top transition duration-500 group-hover:scale-[1.03] ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {!loaded &&
        (failed ? (
          <span className="absolute inset-0 grid place-items-center text-emerald-700/70 text-sm font-medium">
            <span className="flex items-center gap-2"><FaGlobe /> {prettyHost(site)}</span>
          </span>
        ) : (
          <span className="absolute inset-0 animate-pulse bg-white/40" />
        ))}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-t from-stone-900/75 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition">
        <span className="truncate">{prettyHost(site)}</span>
        <FaExternalLinkAlt className="shrink-0 text-[10px]" />
      </span>
    </a>
  );
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
          // skip forks and the profile-README repo (named after the user)
          .filter((r) => !r.fork && r.name.toLowerCase() !== profile.githubUser.toLowerCase())
          .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
          .map((r) => ({
            id: r.id, name: r.name, description: r.description, language: r.language,
            stargazers_count: r.stargazers_count, forks_count: r.forks_count,
            html_url: r.html_url, pushed_at: r.pushed_at, live: liveUrl(r),
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
  const [liveOnly, setLiveOnly] = useState(true);

  const liveCount = useMemo(() => (repos ?? []).filter((r) => r.live).length, [repos]);
  const onlyLive = liveOnly && liveCount > 0; // fall back to all repos if none are deployed
  const pool = useMemo(() => (repos ?? []).filter((r) => !onlyLive || r.live), [repos, onlyLive]);
  const langs = useMemo(() => ["All", ...new Set(pool.map((r) => r.language).filter(Boolean))], [pool]);
  const shown = useMemo(
    () =>
      pool.filter(
        (r) =>
          (lang === "All" || r.language === lang) &&
          (r.name + " " + (r.description ?? "")).toLowerCase().includes(query.trim().toLowerCase())
      ),
    [pool, lang, query]
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
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-col gap-2.5">
        {liveCount > 0 && (
          <div role="tablist" aria-label="Which projects" className="grid grid-cols-2 p-1 rounded-xl bg-stone-100 text-sm">
            {[
              [true, <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live sites ({liveCount})</>],
              [false, <><FaGithub /> All repos ({repos.length})</>],
            ].map(([val, label]) => (
              <button
                key={String(val)}
                role="tab"
                aria-selected={liveOnly === val}
                onClick={() => {
                  setLiveOnly(val);
                  setLang("All");
                }}
                className={`h-9 rounded-lg inline-flex items-center justify-center gap-2 transition ${
                  liveOnly === val ? "bg-white text-stone-900 font-medium shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <label className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-white border border-stone-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-300 select-text"
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
            <div
              key={r.id}
              className="spot group flex flex-col gap-2 p-4 rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              {r.live && <SiteShot name={r.name} site={r.live} />}
              <div className="flex items-start gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  {r.live ? <FaGlobe /> : <FaGithub />}
                </span>
                <h4 className="font-semibold text-slate-900 leading-tight break-all pt-1.5">{r.name}</h4>
                {r.live && (
                  <span className="ml-auto mt-1 inline-flex items-center gap-1 h-5 px-2 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                  </span>
                )}
              </div>
              <p className={`text-sm leading-snug line-clamp-2 min-h-[2lh] ${r.description ? "text-slate-600" : "text-slate-400 italic"}`}>
                {r.description || "No description yet"}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
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
              <div className="flex gap-2 mt-auto pt-1">
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${r.name} code on GitHub`}
                  className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 text-stone-700 text-xs font-medium hover:border-stone-900 transition flex-1`}
                >
                  <FaGithub /> Code
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
