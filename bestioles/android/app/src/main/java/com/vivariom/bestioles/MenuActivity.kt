// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONObject

/** Petit menu quand on touche une bestiole. */
class MenuActivity : Activity() {
    private val especes = listOf(
        "fourmi" to "🐜 Fourmi", "puceron" to "🟢 Puceron", "coccinelle" to "🐞 Coccinelle", "mouche" to "🪰 Mouche",
        "araignee" to "🕷 Araignée", "papillon" to "🦋 Papillon", "mante" to "🦗 Mante", "verluisant" to "✨ Ver luisant",
        "phasme" to "🌿 Phasme", "grillon" to "🎶 Grillon", "solifuge" to "🦂 Solifuge")
    // mêmes valeurs que DEFAUT et NMAX dans bestioles.js
    private val defaut = mapOf("fourmi" to 5, "puceron" to 6, "coccinelle" to 1, "mouche" to 2, "araignee" to 1, "papillon" to 1, "mante" to 0, "verluisant" to 2, "phasme" to 1, "grillon" to 1, "solifuge" to 0)
    private val maxi = mapOf("fourmi" to 15, "puceron" to 14, "coccinelle" to 4, "mouche" to 6, "araignee" to 3, "papillon" to 4, "mante" to 2, "verluisant" to 5, "phasme" to 3, "grillon" to 4, "solifuge" to 2)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent.getIntExtra("id", -1)
        val calme = intent.getBooleanExtra("calme", false)
        val general = intent.getBooleanExtra("general", false) || id < 0
        val d = resources.displayMetrics.density
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((14 * d).toInt(), (12 * d).toInt(), (14 * d).toInt(), (12 * d).toInt()) }

        col.addView(TextView(this).apply {
            text = if (general) "🐞 Bestioles" else intent.getStringExtra("titre") ?: "Bestiole"; textSize = 17f; setTextColor(Color.WHITE)
        })
        col.addView(TextView(this).apply {
            text = if (general) (if (BestiolesService.actif) "Allumées · elles ne gênent jamais tes touches" else "Éteintes") else (intent.getStringExtra("etat") ?: ""); textSize = 12f; setTextColor(Color.parseColor("#9FB48E")); setPadding(0, 0, 0, (8 * d).toInt())
        })
        fun bouton(texte: String, couleur: String = "#E8EEE4", action: () -> Unit) = Button(this).apply {
            text = texte; isAllCaps = false; textSize = 15f; gravity = Gravity.START or Gravity.CENTER_VERTICAL
            setTextColor(Color.parseColor(couleur))
            background = GradientDrawable().apply { setColor(Color.parseColor("#161C15")); cornerRadius = 10 * d; setStroke((1 * d).toInt(), Color.parseColor("#2F3F2A")) }
            setOnClickListener { action() }
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = (6 * d).toInt() }
        }
        // lien direct vers le jeu (s'ouvre dans l'appli Vivariom installée, sinon dans le navigateur)
        if (general) col.addView(bouton("🎮 Jouer à Vivariom", "#FFE94D") {
            try { startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://grecdel.github.io/vivariom/")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
            finish()
        })
        if (general && !BestiolesService.actif) col.addView(bouton("⏻ Allumer les bestioles", "#8BFF6A") { BasculeActivity.basculer(this); finish() })
        if (!general) col.addView(bouton(if (calme) "🏃 La réveiller" else "😌 La calmer") { js("Bestioles.action($id,'${if (calme) "reveiller" else "calmer"}')"); finish() })
        val duo = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        duo.addView(bouton("🍞 Poser une miette") { js(if (general) "Bestioles.nourrir('miette')" else "Bestioles.action($id,'miette')"); finish() }.apply {
            textSize = 13f; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { topMargin = (6 * d).toInt(); rightMargin = (3 * d).toInt() } })
        duo.addView(bouton("🍯 Goutte de miel") { js(if (general) "Bestioles.nourrir('miel')" else "Bestioles.action($id,'miel')"); finish() }.apply {
            textSize = 13f; layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { topMargin = (6 * d).toInt(); leftMargin = (3 * d).toInt() } })
        col.addView(duo)
        if (!general) col.addView(bouton("👋 La faire disparaître") { js("Bestioles.action($id,'retirer')"); finish() })

        val grille = GridLayout(this).apply { columnCount = 2; visibility = android.view.View.GONE }
        for ((esp, nom) in especes) grille.addView(Button(this).apply {
            text = nom; isAllCaps = false; textSize = 13f; setTextColor(Color.parseColor("#E8EEE4"))
            background = GradientDrawable().apply { setColor(Color.parseColor("#161C15")); cornerRadius = 9 * d }
            setOnClickListener { js("Bestioles.ajouter('$esp')"); finish() }
            layoutParams = GridLayout.LayoutParams().apply { width = 0; columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f); setMargins((3 * d).toInt(), (3 * d).toInt(), (3 * d).toInt(), (3 * d).toInt()) }
        })
        col.addView(bouton("➕ Ajouter une bête…") { grille.visibility = if (grille.visibility == android.view.View.GONE) android.view.View.VISIBLE else android.view.View.GONE })
        col.addView(grille)

        // réglages : quelles bêtes, combien (enregistrés par la page et ici)
        val prefs = getSharedPreferences(BestiolesService.PREFS, Context.MODE_PRIVATE)
        val reglages = HashMap(defaut)
        try {
            val o = JSONObject(prefs.getString(BestiolesService.REGLAGES, "") ?: "")
            for (k in defaut.keys) if (o.has(k)) reglages[k] = o.optInt(k, defaut[k] ?: 0).coerceIn(0, maxi[k] ?: 5)
        } catch (_: Exception) {}
        val liste = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; visibility = android.view.View.GONE }
        val chiffres = HashMap<String, TextView>()
        fun changer(esp: String, n: Int) {
            val v = n.coerceIn(0, maxi[esp] ?: 5); reglages[esp] = v; chiffres[esp]?.text = v.toString()
            prefs.edit().putString(BestiolesService.REGLAGES, JSONObject(reglages.toMap()).toString()).apply()
            js("Bestioles.configurer({$esp:$v})")
        }
        fun petit(t: String, action: () -> Unit) = Button(this).apply {
            text = t; isAllCaps = false; textSize = 16f; setTextColor(Color.parseColor("#E8EEE4")); setPadding(0, 0, 0, 0)
            background = GradientDrawable().apply { setColor(Color.parseColor("#161C15")); cornerRadius = 8 * d; setStroke((1 * d).toInt(), Color.parseColor("#2F3F2A")) }
            setOnClickListener { action() }
            layoutParams = LinearLayout.LayoutParams((40 * d).toInt(), (36 * d).toInt())
        }
        for ((esp, nom) in especes) {
            val ligne = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; setPadding(0, (3 * d).toInt(), 0, 0) }
            ligne.addView(TextView(this).apply { text = nom; textSize = 14f; setTextColor(Color.parseColor("#E8EEE4"))
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f) })
            ligne.addView(petit("−") { changer(esp, (reglages[esp] ?: 0) - 1) })
            val chiffre = TextView(this).apply { text = (reglages[esp] ?: 0).toString(); textSize = 15f; gravity = Gravity.CENTER; setTextColor(Color.WHITE)
                layoutParams = LinearLayout.LayoutParams((34 * d).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT) }
            chiffres[esp] = chiffre
            ligne.addView(chiffre)
            ligne.addView(petit("+") { changer(esp, (reglages[esp] ?: 0) + 1) })
            liste.addView(ligne)
        }
        liste.addView(TextView(this).apply {
            text = "Le jour, les vers luisants restent cachés ; la nuit, les papillons dorment ailleurs."
            textSize = 12f; setTextColor(Color.parseColor("#9FB48E")); setPadding(0, (6 * d).toInt(), 0, 0) })
        liste.addView(bouton("↺ Revenir aux réglages de départ") { for ((k, v) in defaut) changer(k, v) })
        col.addView(bouton("⚙️ Réglages : quelles bêtes, combien") { liste.visibility = if (liste.visibility == android.view.View.GONE) android.view.View.VISIBLE else android.view.View.GONE })
        col.addView(liste)
        if (BestiolesService.actif) col.addView(bouton("⏻ Tout éteindre", "#FFB3A8") {
            startService(Intent(this, BestiolesService::class.java).setAction(BestiolesService.ETEINDRE)); finish()
        })
        setContentView(ScrollView(this).apply { addView(col) })
        window.setLayout((300 * d).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun js(commande: String) {
        if (!BestiolesService.actif) return
        startService(Intent(this, BestiolesService::class.java).setAction(BestiolesService.COMMANDE).putExtra("js", commande))
    }
}
