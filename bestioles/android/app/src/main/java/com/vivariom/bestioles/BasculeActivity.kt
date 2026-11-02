// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.app.Activity
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings

/**
 * Invisible : allume ou éteint les bestioles puis se referme.
 * Le widget et la tuile passent par elle : une activité lancée par un geste de l'utilisateur
 * a le droit de démarrer le service, et elle peut ouvrir l'écran d'autorisation si besoin.
 */
class BasculeActivity : Activity() {
    companion object {
        fun intentionWidget(ctx: Context): PendingIntent =
            PendingIntent.getActivity(ctx, 10, Intent(ctx, BasculeActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

        /** Allume ou éteint ; ouvre l'écran principal si l'autorisation manque. */
        fun basculer(ctx: Context) {
            if (BestiolesService.actif) {
                ctx.startService(Intent(ctx, BestiolesService::class.java).setAction(BestiolesService.ETEINDRE))
            } else if (!Settings.canDrawOverlays(ctx)) {
                ctx.startActivity(Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            } else {
                ctx.startForegroundService(Intent(ctx, BestiolesService::class.java).setAction(BestiolesService.ALLUMER))
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        basculer(this)
        finish()
        overridePendingTransition(0, 0)
    }
}
