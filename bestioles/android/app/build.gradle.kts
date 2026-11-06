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
        // numéro de fabrication GitHub : chaque version remplace la précédente (« Mettre à jour »)
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1." + (System.getenv("GITHUB_RUN_NUMBER") ?: "0")
    }
    // les bestioles elles-mêmes : la page commune (bestioles/moteur), aussi utilisée sur Windows et Linux
    sourceSets["main"].assets.srcDirs("../../moteur")
    // clé de signature fixe (secret GitHub BESTIOLES_CLE, jamais dans le dépôt) : les mises à jour
    // s'installent par-dessus. Sans ce secret, clé de débogage (désinstaller avant chaque mise à jour).
    val cle = System.getenv("CLE_FICHIER")
    signingConfigs {
        if (cle != null && file(cle).exists()) create("fixe") {
            storeFile = file(cle)
            storeType = "PKCS12"
            storePassword = System.getenv("CLE_MDP")
            keyAlias = "bestioles"
            keyPassword = System.getenv("CLE_MDP")
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.findByName("fixe") ?: signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
