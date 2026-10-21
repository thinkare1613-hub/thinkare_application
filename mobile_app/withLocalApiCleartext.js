const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withLocalApiCleartext(config, { enabled = false } = {}) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const application = modConfig.modResults.manifest.application?.[0];
    if (application) {
      if (enabled) {
        application.$["android:usesCleartextTraffic"] = "true";
      } else {
        delete application.$["android:usesCleartextTraffic"];
      }
    }

    const queries = manifest.queries ?? [];
    const hasHealthConnectQuery = queries.some((query) =>
      (query.package ?? []).some(
        (entry) => entry.$?.["android:name"] === "com.google.android.apps.healthdata",
      ),
    );
    if (!hasHealthConnectQuery) {
      queries.push({
        package: [{ $: { "android:name": "com.google.android.apps.healthdata" } }],
      });
    }
    manifest.queries = queries;

    return modConfig;
  });
};
