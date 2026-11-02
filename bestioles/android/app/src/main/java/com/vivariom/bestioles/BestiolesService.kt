// Vivariom — Bestioles. © 2026 grecdel — tous droits réservés.
package com.vivariom.bestioles

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.service.quicksettings.TileService
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.RemoteViews
import org.json.JSONArray

/**
 * Les bestioles à l'écran :
 *  - une page web transparente plein écran (la même que sur Windows et Linux), qui ne capte pas les touchers :
 *    tout ce qui est dessous reste utilisable ;
 *  - une petite zone tactile invisible par bête, qui suit sa position : la toucher ouvre son menu.
 */
class BestiolesService : Service() {

    companion object {
        const val ALLUMER = "allumer"
        const val ETEINDRE = "eteindre"
        const val BASCULER = "basculer"
        const val COMMANDE = "commande"   // extra "js" : commande pour la page (Bestioles.action(...))
        private const val CANAL = "bestioles"
        const val PREFS = "bestioles"
        const val REGLAGES = "reglages"   // JSON {espece: nombre}, écrit par la page (bestioles.js)
        @Volatile var actif = false

        /** Met à jour le texte du widget et l'état de la tuile. */
        fun majAffichage(ctx: Context) {
            val gestion = AppWidgetManager.getInstance(ctx)
            val vues = RemoteViews(ctx.packageName, R.layout.widget)
            vues.setTextViewText(R.id.widget_texte, if (actif) "Bestioles\nallumées" else "Bestioles\néteintes")
            vues.setInt(R.id.widget_icone, "setImageAlpha", if (actif) 255 else 110)
            vues.setOnClickPendingIntent(R.id.widget_bouton, BasculeActivity.intentionWidget(ctx))
            gestion.updateAppWidget(ComponentName(ctx, WidgetBestioles::class.java), vues)
            try { TileService.requestListeningState(ctx, ComponentName(ctx, TuileBestioles::class.java)) } catch (_: Exception) {}
        }
    }

    private lateinit var wm: WindowManager
    private var web: WebView? = null
    private val zones = HashMap<Int, View>()
    private val infos = HashMap<Int, Pair<String, String>>() // id -> (titre, état)
    private val calmes = HashSet<Int>()
    private val principal = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        wm = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // toujours passer au premier plan d'abord (obligatoire quand on a été lancé par startForegroundService)
        passerAuPremierPlan()
        when (intent?.action) {
            ETEINDRE -> { arreter(); return START_NOT_STICKY }
            BASCULER -> if (actif) { arreter(); return START_NOT_STICKY }
            COMMANDE -> { intent.getStringExtra("js")?.let { web?.evaluateJavascript(it, null) }; return START_STICKY }
        }
        if (!Settings.canDrawOverlays(this)) { arreter(); return START_NOT_STICKY }
        if (web == null) creerPage()
        actif = true
        majAffichage(this)
        return START_STICKY
    }

    private fun passerAuPremierPlan() {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(CANAL) == null)
            nm.createNotificationChannel(NotificationChannel(CANAL, "Bestioles à l'écran", NotificationManager.IMPORTANCE_LOW))
        val eteindre = PendingIntent.getService(this, 1, Intent(this, BestiolesService::class.java).setAction(ETEINDRE),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val ouvrir = PendingIntent.getActivity(this, 2, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val notif = Notification.Builder(this, CANAL)
            .setSmallIcon(R.drawable.ic_tuile)
            .setContentTitle("Les bestioles se promènent")
            .setContentText("Touche une bête pour la calmer ou la faire disparaître.")
            .setContentIntent(ouvrir)
            .setOngoing(true)
            .addAction(Notification.Action.Builder(null, "Éteindre", eteindre).build())
            .build()
        if (Build.VERSION.SDK_INT >= 34) startForeground(1, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(1, notif)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun creerPage() {
        val w = WebView(this)
        w.setBackgroundColor(Color.TRANSPARENT)
        w.settings.javaScriptEnabled = true
        w.settings.domStorageEnabled = true
        w.addJavascriptInterface(Pont(), "AndroidBestioles")
        w.loadUrl("file:///android_asset/index.html")
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT)
        lp.gravity = Gravity.TOP or Gravity.START
        // Android 12+ : les touchers ne traversent une superposition que si elle n'est pas trop opaque
        lp.alpha = 0.8f
        wm.addView(w, lp)
        web = w
    }

    /** Appelé par la page (bestioles.js). */
    inner class Pont {
        @JavascriptInterface fun positions(json: String) { principal.post { majZones(json) } }
        @JavascriptInterface fun touche(id: Int, esp: String, nom: String, calme: Int) { principal.post { ouvrirMenu(id) } }
        /** Réglages (quelles bêtes, combien) : gardés aussi par l'appli, au cas où la page les perdrait. */
        @JavascriptInterface fun lireReglages(): String = this@BestiolesService.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(REGLAGES, "") ?: ""
        @JavascriptInterface fun ecrireReglages(json: String) { this@BestiolesService.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(REGLAGES, json).apply() }
    }

    private fun majZones(json: String) {
        if (!actif) return
        val d = resources.displayMetrics.density
        val vues = HashSet<Int>()
        val tab = JSONArray(json)
        for (k in 0 until tab.length()) {
            val o = tab.getJSONObject(k)
            val id = o.getInt("id")
            vues.add(id)
            infos[id] = Pair(o.optString("ic") + " " + o.optString("nom"), o.optString("etat"))
            if (o.optInt("calme") == 1) calmes.add(id) else calmes.remove(id)
            val taille = (o.getInt("r") * 2 * d).toInt()
            val x = (o.getInt("x") * d).toInt() - taille / 2
            val y = (o.getInt("y") * d).toInt() - taille / 2
            val zone = zones[id]
            if (zone == null) {
                val v = View(this)
                v.setOnClickListener { ouvrirMenu(id) }
                val lp = WindowManager.LayoutParams(taille, taille,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT)
                lp.gravity = Gravity.TOP or Gravity.START
                lp.x = x; lp.y = y
                try { wm.addView(v, lp); zones[id] = v } catch (_: Exception) {}
            } else {
                val lp = zone.layoutParams as WindowManager.LayoutParams
                if (lp.x != x || lp.y != y || lp.width != taille) {
                    lp.x = x; lp.y = y; lp.width = taille; lp.height = taille
                    try { wm.updateViewLayout(zone, lp) } catch (_: Exception) {}
                }
            }
        }
        val parties = zones.keys.filter { it !in vues }
        for (id in parties) { zones.remove(id)?.let { try { wm.removeView(it) } catch (_: Exception) {} }; infos.remove(id) }
    }

    private fun ouvrirMenu(id: Int) {
        val (titre, etat) = infos[id] ?: Pair("Bestiole", "")
        startActivity(Intent(this, MenuActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION)
            .putExtra("id", id).putExtra("titre", titre).putExtra("etat", etat).putExtra("calme", id in calmes))
    }

    private fun arreter() {
        actif = false
        for (v in zones.values) try { wm.removeView(v) } catch (_: Exception) {}
        zones.clear()
        web?.let { try { wm.removeView(it) } catch (_: Exception) {}; it.destroy() }
        web = null
        majAffichage(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        if (actif) arreter()
        super.onDestroy()
    }
}
