#!/usr/bin/env node

/**
 * Script to delete data values from DHIS2 using the dataValueSets API
 * Usage: node scripts/deleteDataValues.js "orgUnit1,orgUnit2,orgUnit3"
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

// Configuration
const config = {
  dhis2Instance: process.env.DHIS2_CH_INSTANCE || "http://localhost:8080",
  username: process.env.DHIS2_CH_USERNAME || "admin",
  password: process.env.DHIS2_CH_PASSWORD || "district",
};

/**
 * Parse DHIS2 instance URL and determine protocol
 * @param {string} instance - DHIS2 instance (can be domain or full URL)
 * @returns {object} Parsed URL info with protocol and hostname
 */
function parseInstance(instance) {
  // If it doesn't start with http:// or https://, assume https://
  const url =
    instance.startsWith("http://") || instance.startsWith("https://")
      ? instance
      : `https://${instance}`;

  const parsed = new URL(url);
  return {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    port: parsed.port,
    isHttps: parsed.protocol === "https:",
  };
}

// These are the 5 prediction data elements for Dengue in the Laos database
const DATA_ELEMENTS = [
  "tPwG5lfd4LR",
  "M5NGsXiDVFB",
  "eYnzX8opDZR",
  "rSEw4CQuxOa",
  "pslyGeNGzop",
];

/**
 * Generate weekly periods for a range
 * @param {number} weeksBack - Number of weeks in the past from current week
 * @param {number} weeksForward - Number of weeks in the future from current week
 * @returns {string[]} Array of period strings in DHIS2 format (e.g., ["2025W11", "2025W12"])
 */
function generateWeeklyPeriods(weeksBack, weeksForward) {
  const periods = [];
  const today = new Date();

  // Get current week number and year
  function getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
  }

  // Generate periods from weeksBack in the past to weeksForward in the future
  for (let i = -weeksBack; i <= weeksForward; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i * 7);
    const { year, week } = getWeekNumber(targetDate);
    const weekStr = week.toString().padStart(2, "0");
    periods.push(`${year}W${weekStr}`);
  }

  return periods;
}

/**
 * Generate payload for deleting data values
 * @param {string[]} dataElements - Array of data element IDs
 * @param {string[]} periods - Array of period strings (e.g., ["2025W11", "2025W12"])
 * @param {string[]} orgUnits - Array of organization unit IDs
 * @returns {object} Payload object for the DELETE request
 */
function generatePayload(dataElements, periods, orgUnits) {
  const dataValues = [];

  // Generate all combinations of dataElement, period, and orgUnit
  for (const dataElement of dataElements) {
    for (const period of periods) {
      for (const orgUnit of orgUnits) {
        dataValues.push({
          dataElement,
          period,
          orgUnit,
        });
      }
    }
  }

  return { dataValues };
}

/**
 * Trigger analytics table update
 */
function triggerAnalyticsUpdate() {
  const instanceInfo = parseInstance(config.dhis2Instance);
  const protocol = instanceInfo.isHttps ? https : http;
  const auth = Buffer.from(`${config.username}:${config.password}`).toString(
    "base64"
  );

  const options = {
    hostname: instanceInfo.hostname,
    port: instanceInfo.port,
    path: "/api/resourceTables/analytics?skipTrackedEntities=true&skipOutliers=true",
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  };

  const req = protocol.request(options, (res) => {
    let data = "";

    console.log(`\n=== Analytics Update Request ===`);
    console.log(`Status Code: ${res.statusCode}`);

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Response:");
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(data);
      }
      console.log("\n✓ Analytics update triggered successfully");
    });
  });

  req.on("error", (error) => {
    console.error("Error triggering analytics update:", error);
  });

  console.log("\n=== Triggering Analytics Update ===");
  console.log(
    "URL:",
    `${instanceInfo.protocol}://${instanceInfo.hostname}${
      instanceInfo.port ? ":" + instanceInfo.port : ""
    }/api/resourceTables/analytics?skipTrackedEntities=true&skipOutliers=true`
  );

  req.end();
}

/**
 * Send DELETE request to DHIS2
 * @param {object} payload - The payload object
 */
function deleteDataValues(payload) {
  const instanceInfo = parseInstance(config.dhis2Instance);
  const protocol = instanceInfo.isHttps ? https : http;
  const postData = JSON.stringify(payload);

  const auth = Buffer.from(`${config.username}:${config.password}`).toString(
    "base64"
  );

  const options = {
    hostname: instanceInfo.hostname,
    port: instanceInfo.port,
    path: "/api/dataValueSets?importStrategy=DELETE",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      Authorization: `Basic ${auth}`,
    },
  };

  const req = protocol.request(options, (res) => {
    let data = "";

    console.log(`\n=== Delete Data Values Request ===`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("\nResponse:");
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(data);
      }

      // Trigger analytics update after successful deletion
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log("\n✓ Data values deleted successfully");
        triggerAnalyticsUpdate();
      } else {
        console.error(
          "\n✗ Delete operation may have failed. Skipping analytics update."
        );
      }
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error);
  });

  console.log("=== Sending Delete Request ===");
  console.log(
    "URL:",
    `${instanceInfo.protocol}://${instanceInfo.hostname}${
      instanceInfo.port ? ":" + instanceInfo.port : ""
    }/api/dataValueSets?importStrategy=DELETE`
  );
  console.log("Payload preview (first 5 items):");
  console.log(
    JSON.stringify({ dataValues: payload.dataValues.slice(0, 5) }, null, 2)
  );
  console.log(`... and ${payload.dataValues.length - 5} more items`);

  req.write(postData);
  req.end();
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const orgUnitsArg = args.find((arg) => !arg.startsWith("--"));

if (!orgUnitsArg) {
  console.error(
    "Error: Please provide organization units as a comma-separated list"
  );
  console.error(
    'Usage: node scripts/deleteDataValues.js [--dry-run] "orgUnit1,orgUnit2,orgUnit3"'
  );
  console.error(
    'Example: node scripts/deleteDataValues.js "aBcDeFgHiJk,XyZ1234567w,MnOpQrStUvW"'
  );
  console.error(
    'Example (dry run): node scripts/deleteDataValues.js --dry-run "aBcDeFgHiJk,XyZ1234567w,MnOpQrStUvW"'
  );
  process.exit(1);
}

// Parse org units from comma-separated string
const orgUnits = orgUnitsArg
  .split(",")
  .map((ou) => ou.trim())
  .filter((ou) => ou.length > 0);

if (orgUnits.length === 0) {
  console.error("Error: No valid organization units provided");
  process.exit(1);
}

if (dryRun) {
  console.log("\n🔍 DRY RUN MODE - No data will be deleted\n");
}

console.log(`Organization units: ${orgUnits.join(", ")}`);

// Generate periods: previous 52 weeks and next 18 weeks
const periods = generateWeeklyPeriods(52, 18);
console.log(
  `Generated ${periods.length} periods (52 weeks back + current week + 18 weeks forward)`
);
console.log(`Period range: ${periods[0]} to ${periods[periods.length - 1]}`);

// Generate payload with all 5 data elements
const payload = generatePayload(DATA_ELEMENTS, periods, orgUnits);
console.log(`Total data values to delete: ${payload.dataValues.length}`);
console.log(`  - Data elements: ${DATA_ELEMENTS.length}`);
console.log(`  - Periods: ${periods.length}`);
console.log(`  - Org units: ${orgUnits.length}`);
console.log();

if (dryRun) {
  console.log("=== DRY RUN: Preview of Delete Request ===");
  const instanceInfo = parseInstance(config.dhis2Instance);
  console.log(
    "Would send DELETE request to:",
    `${instanceInfo.protocol}://${instanceInfo.hostname}${
      instanceInfo.port ? ":" + instanceInfo.port : ""
    }/api/dataValueSets?importStrategy=DELETE`
  );
  console.log("\nPayload preview (first 10 items):");
  console.log(
    JSON.stringify({ dataValues: payload.dataValues.slice(0, 10) }, null, 2)
  );
  if (payload.dataValues.length > 10) {
    console.log(`... and ${payload.dataValues.length - 10} more items`);
  }
  console.log("\n=== DRY RUN: Would then trigger analytics update ===");
  console.log(
    "Would send POST request to:",
    `${instanceInfo.protocol}://${instanceInfo.hostname}${
      instanceInfo.port ? ":" + instanceInfo.port : ""
    }/api/resourceTables/analytics?skipTrackedEntities=true&skipOutliers=true`
  );
  console.log("\n✓ Dry run complete. Use without --dry-run flag to execute.");
} else {
  deleteDataValues(payload);
}
