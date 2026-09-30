const { tavily } = require("@tavily/core");
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
async function run() {
  try {
    const res = await tvly.extract(["https://en.wikipedia.org/wiki/OpenAI"]);
    console.log(Object.keys(res));
    console.log("Extract success:", !!res.results);
  } catch(e) {
    console.error("Extract failed:", e.message);
  }
}
run();
