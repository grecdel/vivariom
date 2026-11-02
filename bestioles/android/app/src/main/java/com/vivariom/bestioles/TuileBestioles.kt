// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

/** Bouton « Bestioles » dans les réglages rapides (le volet qu'on tire du haut de l'écran). */
class TuileBestioles : TileService() {
    override fun onStartListening() { maj() }

    @SuppressLint("StartActivityAndCollapseDeprecated")
    override fun onClick() {
        val i = Intent(this, BasculeActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (Build.VERSION.SDK_INT >= 34) {
            startActivityAndCollapse(PendingIntent.getActivity(this, 11, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
        } else {
            @Suppress("DEPRECATION") startActivityAndCollapse(i)
        }
        qsTile?.let { it.state = if (BestiolesService.actif) Tile.STATE_INACTIVE else Tile.STATE_ACTIVE; it.updateTile() }
    }

    private fun maj() {
        val t = qsTile ?: return
        t.state = if (BestiolesService.actif) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        t.label = "Bestioles"
        t.updateTile()
    }
}
