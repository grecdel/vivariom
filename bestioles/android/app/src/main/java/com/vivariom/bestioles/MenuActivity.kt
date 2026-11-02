// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView

/** Petit menu quand on touche une bestiole. */
class MenuActivity : Activity() {
    private val especes = listOf(
        "fourmi" to "🐜 Fourmi", "puceron" to "🟢 Puceron", "coccinelle" to "🐞 Coccinelle", "mouche" to "🪰 Mouche",
        "araignee" to "🕷 Araignée", "papillon" to "🦋 Papillon", "mante" to "🦗 Mante")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent.getIntExtra("id", -1)
        val calme = intent.getBooleanExtra("calme", false)
        val d = resources.displayMetrics.density
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((14 * d).toInt(), (12 * d).toInt(), (14 * d).toInt(), (12 * d).toInt()) }

        col.addView(TextView(this).apply {
            text = intent.getStringExtra("titre") ?: "Bestiole"; textSize = 17f; setTextColor(Color.WHITE)
        })
        col.addView(TextView(this).apply {
            text = intent.getStringExtra("etat") ?: ""; textSize = 12f; setTextColor(Color.parseColor("#9FB48E")); setPadding(0, 0, 0, (8 * d).toInt())
        })
        fun bouton(texte: String, couleur: String = "#E8EEE4", action: () -> Unit) = Button(this).apply {
            text = texte; isAllCaps = false; textSize = 15f; gravity = Gravity.START or Gravity.CENTER_VERTICAL
            setTextColor(Color.parseColor(couleur))
            background = GradientDrawable().apply { setColor(Color.parseColor("#161C15")); cornerRadius = 10 * d; setStroke((1 * d).toInt(), Color.parseColor("#2F3F2A")) }
            setOnClickListener { action() }
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = (6 * d).toInt() }
        }
        col.addView(bouton(if (calme) "🏃 La réveiller" else "😌 La calmer") { js("Bestioles.action($id,'${if (calme) "reveiller" else "calmer"}')"); finish() })
        col.addView(bouton("👋 La faire disparaître") { js("Bestioles.action($id,'retirer')"); finish() })

        val grille = GridLayout(this).apply { columnCount = 2; visibility = android.view.View.GONE }
        for ((esp, nom) in especes) grille.addView(Button(this).apply {
            text = nom; isAllCaps = false; textSize = 13f; setTextColor(Color.parseColor("#E8EEE4"))
            background = GradientDrawable().apply { setColor(Color.parseColor("#161C15")); cornerRadius = 9 * d }
            setOnClickListener { js("Bestioles.ajouter('$esp')"); finish() }
            layoutParams = GridLayout.LayoutParams().apply { width = 0; columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f); setMargins((3 * d).toInt(), (3 * d).toInt(), (3 * d).toInt(), (3 * d).toInt()) }
        })
        col.addView(bouton("➕ Ajouter une bête…") { grille.visibility = if (grille.visibility == android.view.View.GONE) android.view.View.VISIBLE else android.view.View.GONE })
        col.addView(grille)
        col.addView(bouton("⏻ Tout éteindre", "#FFB3A8") {
            startService(Intent(this, BestiolesService::class.java).setAction(BestiolesService.ETEINDRE)); finish()
        })
        setContentView(col)
        window.setLayout((300 * d).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun js(commande: String) {
        startService(Intent(this, BestiolesService::class.java).setAction(BestiolesService.COMMANDE).putExtra("js", commande))
    }
}
