const fs = require("fs");
const pdf = require("pdf-parse");

const dataBuffer = fs.readFileSync("C:/Users/prant/Downloads/AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf");

pdf(dataBuffer).then(function(data) {
    console.log("Pages:", data.numpages);
    console.log("Text length:", data.text.length);
    console.log("--- FIRST 1500 CHARACTERS ---");
    console.log(data.text.slice(0, 1500));
}).catch(console.error);
