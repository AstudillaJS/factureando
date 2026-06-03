const token = process.env.GH_TOKEN || "";
const repo = "AstudillaJS/factureando";

async function run() {
  try {
    // 1. Get releases
    const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    const releases = await res.json();
    const draft = releases.find(r => r.tag_name === 'v1.0.15' && r.draft === true);
    
    if (!draft) {
      console.log("No draft release found for v1.0.15");
      return;
    }
    
    // 2. Publish it
    const updateRes = await fetch(`https://api.github.com/repos/${repo}/releases/${draft.id}`, {
      method: 'PATCH',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ draft: false })
    });
    
    const updated = await updateRes.json();
    console.log("Release published successfully:", updated.html_url);
  } catch (error) {
    console.error("Error publishing release:", error);
  }
}

run();
