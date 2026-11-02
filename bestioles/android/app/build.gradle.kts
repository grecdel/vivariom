plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.vivariom.bestioles"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.vivariom.bestioles"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    // les bestioles elles-mêmes : la page commune (bestioles/moteur), aussi utilisée sur Windows et Linux
    sourceSets["main"].assets.srcDirs("../../moteur")
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
