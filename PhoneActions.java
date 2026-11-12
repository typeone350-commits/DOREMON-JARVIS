package com.tgmeta.doremonjarvis;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.net.Uri;
import android.provider.AlarmClock;
import android.provider.ContactsContract;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Small helpers for things the phone can do: call a saved contact, set an alarm, torch, WiFi/data panel
public class PhoneActions {

    public static boolean has(Context c, String perm) {
        return ContextCompat.checkSelfPermission(c, perm) == PackageManager.PERMISSION_GRANTED;
    }

    // ------------------------------------------------------------ contacts + call

    public static class Match {
        public String name;
        public String number;
        public int score;
    }

    public static Match findContact(Context c, String query) {
        String q = norm(query);
        if (q.isEmpty()) return null;
        Match best = null;
        Cursor cur = null;
        try {
            cur = c.getContentResolver().query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                    new String[]{ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                            ContactsContract.CommonDataKinds.Phone.NUMBER},
                    null, null, null);
            if (cur == null) return null;
            while (cur.moveToNext()) {
                String name = cur.getString(0);
                String number = cur.getString(1);
                if (name == null || number == null) continue;
                int sc = score(norm(name), q);
                if (sc >= 45 && (best == null || sc > best.score)) {
                    best = new Match();
                    best.name = name;
                    best.number = number;
                    best.score = sc;
                }
            }
        } catch (Exception ignored) {
        } finally {
            if (cur != null) cur.close();
        }
        return best;
    }

    private static String norm(String s) {
        StringBuilder b = new StringBuilder();
        for (char ch : s.toLowerCase(Locale.ROOT).toCharArray()) {
            b.append(Character.isLetterOrDigit(ch) ? ch : ' ');
        }
        return b.toString().replaceAll("\\s+", " ").trim();
    }

    private static int score(String name, String q) {
        if (name.equals(q)) return 100;
        String[] nt = name.split(" ");
        String[] qt = q.split(" ");
        int hit = 0;
        for (String w : qt) {
            for (String n : nt) {
                if (n.equals(w)) { hit++; break; }
            }
        }
        if (hit == qt.length) return 90 - Math.min(10, (nt.length - qt.length) * 2);
        if (name.contains(q)) return 60;
        int fuzzy = 0;
        for (String w : qt) {
            int bestD = 99;
            for (String n : nt) bestD = Math.min(bestD, lev(w, n));
            if (bestD <= Math.max(1, w.length() / 4)) fuzzy++;
        }
        if (fuzzy == qt.length) return 50;
        return 0;
    }

    private static int lev(String a, String b) {
        int[] prev = new int[b.length() + 1];
        int[] cur = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) prev[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            cur[0] = i;
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                cur[j] = Math.min(Math.min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }
            int[] t = prev; prev = cur; cur = t;
        }
        return prev[b.length()];
    }

    // "called" = call started, "dialer" = no call permission so only the dialer opened
    public static String call(Context c, String number) {
        try {
            boolean canCall = has(c, Manifest.permission.CALL_PHONE);
            Intent i = new Intent(canCall ? Intent.ACTION_CALL : Intent.ACTION_DIAL,
                    Uri.parse("tel:" + Uri.encode(number)));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            return canCall ? "called" : "dialer";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }

    // ------------------------------------------------------------ alarm

    public static String setAlarm(Context c, int hour, int minute, String label) {
        try {
            Intent i = new Intent(AlarmClock.ACTION_SET_ALARM)
                    .putExtra(AlarmClock.EXTRA_HOUR, hour)
                    .putExtra(AlarmClock.EXTRA_MINUTES, minute)
                    .putExtra(AlarmClock.EXTRA_MESSAGE, label)
                    .putExtra(AlarmClock.EXTRA_SKIP_UI, true);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            return "ok";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }

    private static final Map<String, Integer> NUMWORDS = new HashMap<>();
    static {
        String[][] w = {{"ek", "1"}, {"one", "1"}, {"do", "2"}, {"two", "2"}, {"teen", "3"}, {"three", "3"},
                {"char", "4"}, {"chaar", "4"}, {"four", "4"}, {"panch", "5"}, {"paanch", "5"}, {"five", "5"},
                {"chhe", "6"}, {"che", "6"}, {"chay", "6"}, {"six", "6"}, {"saat", "7"}, {"seven", "7"},
                {"aath", "8"}, {"eight", "8"}, {"nau", "9"}, {"nine", "9"}, {"das", "10"}, {"ten", "10"},
                {"gyarah", "11"}, {"eleven", "11"}, {"barah", "12"}, {"twelve", "12"}};
        for (String[] p : w) NUMWORDS.put(p[0], Integer.parseInt(p[1]));
    }

    // understands "7 baje", "7:30 pm", "subah 6 baje", "saade saat baje", "do baje" ...
    // returns {hour(0-23), minute} or null
    public static int[] parseTime(String raw) {
        String t = raw.toLowerCase(Locale.ROOT).replace("a.m.", "am").replace("p.m.", "pm");
        boolean pm = Pattern.compile("\\b(pm|shaam|sham|raat|evening|night|dopahar|dupahar|afternoon)\\b").matcher(t).find();
        boolean am = Pattern.compile("\\b(am|subah|subha|morning|savere|fajar|fajr)\\b").matcher(t).find();
        int h = -1, min = 0;
        Matcher m = Pattern.compile("\\b(\\d{1,2})(?:[:.](\\d{2}))?\\b").matcher(t);
        if (m.find()) {
            h = Integer.parseInt(m.group(1));
            if (m.group(2) != null) min = Integer.parseInt(m.group(2));
        } else {
            Matcher w = Pattern.compile("\\b(ek|one|do|two|teen|three|char|chaar|four|panch|paanch|five|chhe|che|chay|six|"
                    + "saat|seven|aath|eight|nau|nine|das|ten|gyarah|eleven|barah|twelve)\\s+(baje|bje|bajay|am|pm|oclock)\\b").matcher(t);
            if (w.find()) h = NUMWORDS.get(w.group(1));
        }
        if (h < 0) return null;
        if (t.contains("saade") || t.contains("sade")) min = 30;
        if (h > 23 || min > 59) return null;
        if (h > 12) return new int[]{h, min};
        if (pm && h < 12) h += 12;
        else if (am && h == 12) h = 0;
        else if (!am && !pm) {
            // no am/pm said: pick the next time that comes up
            Calendar now = Calendar.getInstance();
            int nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
            int a = (h % 12) * 60 + min;
            int b = a + 720;
            int best = a, bestDiff = Integer.MAX_VALUE;
            for (int cnd : new int[]{a, b}) {
                int d = (cnd - nowMin + 1440) % 1440;
                if (d == 0) d = 1440;
                if (d < bestDiff) { bestDiff = d; best = cnd; }
            }
            h = best / 60;
            min = best % 60;
        }
        return new int[]{h, min};
    }

    public static String friendly(int h, int m) {
        String part = h < 12 ? "subah" : h < 16 ? "dopahar" : h < 19 ? "shaam" : "raat";
        int h12 = h % 12 == 0 ? 12 : h % 12;
        return part + " " + h12 + ":" + String.format(Locale.US, "%02d", m);
    }

    // ------------------------------------------------------------ flashlight

    // "ok", "noflash" or "error: ..."
    public static String torch(Context c, boolean on) {
        try {
            CameraManager cm = (CameraManager) c.getSystemService(Context.CAMERA_SERVICE);
            for (String id : cm.getCameraIdList()) {
                CameraCharacteristics ch = cm.getCameraCharacteristics(id);
                Boolean flash = ch.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                Integer lens = ch.get(CameraCharacteristics.LENS_FACING);
                if (flash != null && flash && lens != null && lens == CameraCharacteristics.LENS_FACING_BACK) {
                    cm.setTorchMode(id, on);
                    return "ok";
                }
            }
            return "noflash";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }

    // ------------------------------------------------------------ WiFi / mobile data

    // Android does not let apps flip these switches, so open the system Internet panel
    // and let the Accessibility service press the switch.
    public static boolean openInternetPanel(Context c) {
        try {
            Intent i = new Intent(Settings.Panel.ACTION_INTERNET_CONNECTIVITY);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
