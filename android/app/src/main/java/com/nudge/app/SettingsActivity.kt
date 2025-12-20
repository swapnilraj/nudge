package com.nudge.app

import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.SeekBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import org.json.JSONArray
import org.json.JSONObject

class SettingsActivity : AppCompatActivity() {

  private val prefsName = "nudge_prefs"
  private val appsKey = "weighted_apps_json"

  private lateinit var adapter: AppAdapter

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_settings)

    val search = findViewById<EditText>(R.id.search)
    val recycler = findViewById<RecyclerView>(R.id.recycler)
    val save = findViewById<View>(R.id.saveButton)

    recycler.layoutManager = LinearLayoutManager(this)

    val allApps = loadLaunchableApps()
    val existing = loadExistingWeights()

    adapter = AppAdapter(
      allApps = allApps,
      initialWeights = existing
    )
    recycler.adapter = adapter

    search.addTextChangedListener(object : TextWatcher {
      override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
      override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
        adapter.setQuery(s?.toString().orEmpty())
      }
      override fun afterTextChanged(s: Editable?) {}
    })

    save.setOnClickListener {
      persistWeights(adapter.exportSelectedWeightsJson())
      finish()
    }
  }

  private fun loadLaunchableApps(): List<AppInfo> {
    val pm = packageManager
    val intent = android.content.Intent(android.content.Intent.ACTION_MAIN, null).apply {
      addCategory(android.content.Intent.CATEGORY_LAUNCHER)
    }
    val resolved = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
    return resolved
      .mapNotNull { ri ->
        val ai = ri.activityInfo?.applicationInfo ?: return@mapNotNull null
        val label = ri.loadLabel(pm)?.toString()?.trim().orEmpty()
        val pkg = ai.packageName?.trim().orEmpty()
        if (pkg.isEmpty()) return@mapNotNull null
        AppInfo(
          label = if (label.isNotEmpty()) label else pkg,
          packageName = pkg,
          icon = ri.loadIcon(pm)
        )
      }
      .sortedBy { it.label.lowercase() }
  }

  private fun loadExistingWeights(): Map<String, Int> {
    val json = getSharedPreferences(prefsName, MODE_PRIVATE).getString(appsKey, null) ?: return emptyMap()
    return try {
      val arr = JSONArray(json)
      buildMap {
        for (i in 0 until arr.length()) {
          val obj = arr.optJSONObject(i) ?: continue
          val pkg = obj.optString("packageName", "").trim()
          val weight = obj.optInt("weight", 0)
          if (pkg.isNotEmpty() && weight > 0) put(pkg, weight)
        }
      }
    } catch (_: Exception) {
      emptyMap()
    }
  }

  private fun persistWeights(json: String) {
    getSharedPreferences(prefsName, MODE_PRIVATE)
      .edit()
      .putString(appsKey, json)
      .apply()
  }
}

data class AppInfo(
  val label: String,
  val packageName: String,
  val icon: Drawable?
)

private class AppAdapter(
  private val allApps: List<AppInfo>,
  initialWeights: Map<String, Int>
) : RecyclerView.Adapter<AppViewHolder>() {

  private val weights: MutableMap<String, Int> = initialWeights.toMutableMap()
  private var query: String = ""
  private var filtered: List<AppInfo> = allApps

  fun setQuery(q: String) {
    query = q.trim().lowercase()
    filtered = if (query.isEmpty()) {
      allApps
    } else {
      allApps.filter { it.label.lowercase().contains(query) || it.packageName.lowercase().contains(query) }
    }
    notifyDataSetChanged()
  }

  fun exportSelectedWeightsJson(): String {
    val arr = JSONArray()
    // keep stable ordering by label
    val selected = allApps.filter { (weights[it.packageName] ?: 0) > 0 }
    for (app in selected) {
      val obj = JSONObject()
      obj.put("packageName", app.packageName)
      obj.put("weight", weights[app.packageName] ?: 0)
      arr.put(obj)
    }
    return arr.toString()
  }

  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AppViewHolder {
    val v = LayoutInflater.from(parent.context).inflate(R.layout.item_app, parent, false)
    return AppViewHolder(v)
  }

  override fun getItemCount(): Int = filtered.size

  override fun onBindViewHolder(holder: AppViewHolder, position: Int) {
    val app = filtered[position]
    val current = weights[app.packageName] ?: 0
    holder.bind(app, current) { newWeight ->
      weights[app.packageName] = newWeight
    }
  }
}

private class AppViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
  private val icon = itemView.findViewById<ImageView>(R.id.icon)
  private val title = itemView.findViewById<TextView>(R.id.title)
  private val subtitle = itemView.findViewById<TextView>(R.id.subtitle)
  private val weightLabel = itemView.findViewById<TextView>(R.id.weightLabel)
  private val weight = itemView.findViewById<SeekBar>(R.id.weight)

  fun bind(app: AppInfo, currentWeight: Int, onWeightChanged: (Int) -> Unit) {
    icon.setImageDrawable(app.icon)
    title.text = app.label
    subtitle.text = app.packageName

    weight.max = 10
    weight.progress = currentWeight.coerceIn(0, 10)
    weightLabel.text = if (weight.progress == 0) "Off" else "Weight: ${weight.progress}"

    weight.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
      override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
        weightLabel.text = if (progress == 0) "Off" else "Weight: $progress"
        onWeightChanged(progress)
      }
      override fun onStartTrackingTouch(seekBar: SeekBar?) {}
      override fun onStopTrackingTouch(seekBar: SeekBar?) {}
    })
  }
}


