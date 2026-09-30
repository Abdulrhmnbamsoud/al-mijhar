const { tavily } = require("@tavily/core");
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
async function run() {
  try {
    const res = await tvly.extract(["https://www.linkedin.com/in/williamhgates/"]);
    console.log("Extract success:", !!res.results);
    if (res.results && res.results[0]) {
       console.log(res.results[0].rawContent.slice(0, 200));
    }
  } catch(e) {
    console.error("Extract failed:", e.message);
  }
}
run();
