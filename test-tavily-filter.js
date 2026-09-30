const { tavily } = require("@tavily/core");
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
async function run() {
  const guestName = "محمد بن عيسى البيز";
  const queries = [`"${guestName}"`];
  let allResults = [];
  for (const q of queries) {
    const res = await tvly.search(q, { searchDepth: "advanced", maxResults: 25 });
    allResults = allResults.concat(res.results);
  }

  const guestNameWords = guestName.trim().split(" ");
  const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values()).filter(r => {
    const text = (r.title + " " + r.content).toLowerCase();
    const name = guestName.toLowerCase();
    if (text.includes(name)) return true;
    if (guestNameWords.length > 1) {
      const firstAndLast = guestNameWords[0].toLowerCase() + " " + guestNameWords[guestNameWords.length - 1].toLowerCase();
      if (text.includes(firstAndLast)) return true;
    }
    return false;
  });

  console.log("Total fetched:", allResults.length);
  console.log("Filtered results length:", uniqueResults.length);
  if (uniqueResults.length === 0 && allResults.length > 0) {
    console.log("Sample title:", allResults[0].title);
    console.log("Sample content:", allResults[0].content);
  }
}
run();
