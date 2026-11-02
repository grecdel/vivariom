// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context

/** Widget de l'écran d'accueil : un bouton qui allume ou éteint les bestioles. */
class WidgetBestioles : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, gestion: AppWidgetManager, ids: IntArray) {
        BestiolesService.majAffichage(ctx)
    }
}
