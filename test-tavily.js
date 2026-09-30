const { tavily } = require("@tavily/core");
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
async function run() {
  try {
    const res = await tvly.search("محمد بن عيسى البيز", { searchDepth: "advanced", maxResults: 25 });
    console.log("Success! Results length:", res.results.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
