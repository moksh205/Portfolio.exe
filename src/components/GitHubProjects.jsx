import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

export default function GitHubProjects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchRepos = async () => {
    try {
      const res = await fetch("https://api.github.com/users/moksh205/repos");
      let data = await res.json();

      // Sort by latest updated first
      data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      setRepos(data);
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRepos();
}, []);


  if (loading) return <p className="text-green-300 text-sm">Loading GitHub projects…</p>;
  if (!repos.length) return <p className="text-green-300 text-sm">No GitHub projects found.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-auto">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-2 bg-black/20 rounded cursor-pointer hover:bg-black/50 transition"
        >
          <div className="text-3xl text-green-300">
            <FaGithub />
          </div>
          <span className="mt-1 text-xs sm:text-sm text-center">{repo.name}</span>
        </a>
      ))}
    </div>
  );
}
