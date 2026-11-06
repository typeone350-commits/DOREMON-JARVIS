package com.tgmeta.doremonjarvis;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "JarvisBridge")
public class JarvisBridge extends Plugin {

    // Web app calls this to share Groq key / model / language with the native overlay
    @PluginMethod
    public void saveConfig(PluginCall call) {
        SharedPreferences.Editor e = getContext()
                .getSharedPreferences("jarvis", Context.MODE_PRIVATE).edit();
        if (call.hasOption("key")) e.putString("key", call.getString("key", ""));
        if (call.hasOption("model")) e.putString("model", call.getString("model", ""));
        if (call.hasOption("lang")) e.putString("lang", call.getString("lang", "auto"));
        e.apply();
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject o = new JSObject();
        o.put("overlay", Settings.canDrawOverlays(getContext()));
        o.put("running", OverlayService.running);
        o.put("mic", ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED);
        call.resolve(o);
    }

    @PluginMethod
    public void askPermissions(PluginCall call) {
        String[] perms = Build.VERSION.SDK_INT >= 33
                ? new String[]{Manifest.permission.RECORD_AUDIO, Manifest.permission.POST_NOTIFICATIONS}
                : new String[]{Manifest.permission.RECORD_AUDIO};
        ActivityCompat.requestPermissions(getActivity(), perms, 77);
        call.resolve();
    }

    @PluginMethod
    public void startOverlay(PluginCall call) {
        Context c = getContext();
        if (!Settings.canDrawOverlays(c)) {
            Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + c.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            call.reject("overlay_permission");
            return;
        }
        if (ContextCompat.checkSelfPermission(c, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            call.reject("mic_permission");
            return;
        }
        try {
            Intent s = new Intent(c, OverlayService.class);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(s);
            else c.startService(s);
            call.resolve();
        } catch (Exception e) {
            call.reject("start_failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopOverlay(PluginCall call) {
        Context c = getContext();
        c.stopService(new Intent(c, OverlayService.class));
        call.resolve();
    }
}
