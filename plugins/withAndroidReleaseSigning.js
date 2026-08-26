const { withAppBuildGradle } = require("expo/config-plugins");

const SIGNING_VARIABLES = `
def gatherReleaseStoreFile = rootProject.file("../.signing/gather-release.keystore")
def gatherReleaseStorePassword = findProperty("GATHER_RELEASE_STORE_PASSWORD")
def gatherReleaseKeyAlias = "gather-release"
def isGatherReleaseBuild = gradle.startParameter.taskNames.any {
    it.toLowerCase().contains("release")
}

if (isGatherReleaseBuild && !gatherReleaseStoreFile.exists()) {
    throw new GradleException("Missing .signing/gather-release.keystore. Run scripts/setup-android-signing.ps1 first.")
}

if (isGatherReleaseBuild && !gatherReleaseStorePassword) {
    throw new GradleException("Missing GATHER_RELEASE_STORE_PASSWORD in the user Gradle properties.")
}
`;

const RELEASE_SIGNING_CONFIG = `        release {
            storeFile gatherReleaseStoreFile
            storePassword gatherReleaseStorePassword
            keyAlias gatherReleaseKeyAlias
            keyPassword gatherReleaseStorePassword
        }
`;

function applyReleaseSigning(buildGradle) {
  let contents = buildGradle;

  if (!contents.includes("def gatherReleaseStoreFile")) {
    const projectRootLine =
      "def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()";

    if (!contents.includes(projectRootLine)) {
      throw new Error("Could not find the projectRoot declaration in android/app/build.gradle");
    }

    contents = contents.replace(
      projectRootLine,
      `${projectRootLine}\n${SIGNING_VARIABLES}`,
    );
  }

  if (!contents.includes("release {\n            storeFile gatherReleaseStoreFile")) {
    const signingConfigsPattern = /(    signingConfigs \{[\s\S]*?        debug \{[\s\S]*?        \}\n)(    \}\n    buildTypes \{)/;

    if (!signingConfigsPattern.test(contents)) {
      throw new Error("Could not find signingConfigs in android/app/build.gradle");
    }

    contents = contents.replace(
      signingConfigsPattern,
      `$1${RELEASE_SIGNING_CONFIG}$2`,
    );
  }

  const debugReleaseSigning = `            signingConfig signingConfigs.debug
            def enableShrinkResources`;
  const permanentReleaseSigning = `            signingConfig signingConfigs.release
            def enableShrinkResources`;

  if (contents.includes(debugReleaseSigning)) {
    contents = contents.replace(debugReleaseSigning, permanentReleaseSigning);
  } else if (!contents.includes(permanentReleaseSigning)) {
    throw new Error("Could not configure the release signingConfig in android/app/build.gradle");
  }

  return contents;
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.language !== "groovy") {
      throw new Error("Android release signing currently supports Groovy Gradle files only");
    }

    gradleConfig.modResults.contents = applyReleaseSigning(
      gradleConfig.modResults.contents,
    );

    return gradleConfig;
  });
};

module.exports.applyReleaseSigning = applyReleaseSigning;
