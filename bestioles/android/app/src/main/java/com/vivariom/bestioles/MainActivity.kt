// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.Manifest
import android.app.Activity
import android.app.StatusBarManager
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/** Écran principal : autorisation, allumer / éteindre, ajouter le widget et le bouton des réglages rapides. */
class MainActivity : Activity() {
    private lateinit var etat: TextView
    private lateinit var interrupteur: Button
    private lateinit var autoriser: Button
    private lateinit var discret: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val d = resources.displayMetrics.density
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((20 * d).toInt(), (28 * d).toInt(), (20 * d).toInt(), (20 * d).toInt()) }
        fun texte(t: String, taille: Float = 15f, couleur: String = "#C9D2C4") = TextView(this).apply {
            text = t; textSize = taille; setTextColor(Color.parseColor(couleur)); setPadding(0, (6 * d).toInt(), 0, (6 * d).toInt()) }
        fun bouton(t: String, fond: String, encre: String, action: () -> Unit) = Button(this).apply {
            text = t; isAllCaps = false; textSize = 16f; setTextColor(Color.parseColor(encre))
            background = GradientDrawable().apply { setColor(Color.parseColor(fond)); cornerRadius = 12 * d }
            setOnClickListener { action() }
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = (10 * d).toInt() }
        }
        col.addView(texte("🐞 Bestioles", 26f, "#FFE94D"))
        col.addView(texte("Des petites bêtes de Vivariom qui vivent sur ton écran : fourmis, coccinelle, araignée, papillon, mouches… Elles se promènent, chassent et s'évitent, par-dessus tes applis, sans rien toucher. Elles ne gênent jamais tes touches : tu peux écrire et toucher tes boutons à travers elles. Les options sont sur le widget (⚙) et dans la notification."))
        autoriser = bouton("1. Autoriser l'affichage par-dessus les autres applis", "#2A3A26", "#E8EEE4") {
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
        }
        col.addView(autoriser)
        interrupteur = bouton("Allumer les bestioles", "#FFE94D", "#0B0E0A") { BasculeActivity.basculer(this); interrupteur.postDelayed({ maj() }, 400) }
        col.addView(interrupteur)
        etat = texte("", 13f, "#9FB48E")
        col.addView(etat)
        col.addView(texte("Discrètes dans les applis : quand tu ouvres une appli, une ou deux bêtes seulement restent ; au retour sur l'écran d'accueil, toutes ressortent, comme sous une souche qu'on soulève. Il faut pour ça autoriser Bestioles à savoir quelle appli est ouverte (rien n'est envoyé nulle part).", 13f))
        discret = bouton("2. Autoriser « Accès aux données d'utilisation »", "#2A3A26", "#E8EEE4") {
            try { startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) } catch (_: Exception) {}
        }
        col.addView(discret)
        col.addView(texte("Pour les allumer et les éteindre d'un geste :", 15f, "#E8EEE4"))
        col.addView(bouton("➕ Ajouter le widget sur l'écran d'accueil", "#161C15", "#E8EEE4") {
            val am = getSystemService(AppWidgetManager::class.java)
            if (am.isRequestPinAppWidgetSupported) am.requestPinAppWidget(ComponentName(this, WidgetBestioles::class.java), null, null)
            else etat.text = "Ton téléphone ne permet pas de l'ajouter d'ici : appui long sur l'écran d'accueil, puis « Widgets », puis « Bestioles »."
        })
        if (Build.VERSION.SDK_INT >= 33) col.addView(bouton("➕ Ajouter le bouton aux réglages rapides", "#161C15", "#E8EEE4") {
            getSystemService(StatusBarManager::class.java).requestAddTileService(ComponentName(this, TuileBestioles::class.java), "Bestioles",
                Icon.createWithResource(this, R.drawable.ic_tuile), mainExecutor) { }
        })
        col.addView(texte("Sinon : appui long sur l'écran d'accueil → Widgets → Bestioles. Pour les réglages rapides : tire le volet du haut, touche le crayon ✏ et glisse « Bestioles ».", 13f))
        col.addView(texte("© 2026 grecdel — tous droits réservés.", 11f, "#6E7A68"))
        setContentView(ScrollView(this).apply { addView(col) })
        if (Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
    }

    override fun onResume() { super.onResume(); maj() }

    private fun maj() {
        val ok = Settings.canDrawOverlays(this)
        autoriser.text = if (ok) "✔ Affichage par-dessus les applis autorisé" else "1. Autoriser l'affichage par-dessus les autres applis"
        autoriser.isEnabled = !ok
        val u = BestiolesService.accesUtilisation(this)
        discret.text = if (u) "✔ Bêtes discrètes dans les applis" else "2. Autoriser « Accès aux données d'utilisation »"
        discret.isEnabled = !u
        interrupteur.isEnabled = ok
        interrupteur.text = if (BestiolesService.actif) "Éteindre les bestioles" else "Allumer les bestioles"
        etat.text = if (!ok) "Commence par l'autorisation : sans elle, les bêtes ne peuvent pas sortir de l'appli."
            else if (BestiolesService.actif) "Les bestioles se promènent sur ton écran." else "Les bestioles dorment."
    }
}
