package com.tgmeta.doremonjarvis;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.RectF;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class OverlayService extends Service implements TextToSpeech.OnInitListener {

    public static boolean running = false;

    private WindowManager wm;
    private DoraView view;
    private WindowManager.LayoutParams lp;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private MediaRecorder rec;
    private File audioFile;
    private boolean recording = false;
    private SharedPreferences sp;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final List<String[]> history = new ArrayList<>();

    // name aliases | package | search url prefix | display name   (longest alias first)
    private static final String[][] APPS = {
        {"youtube|yutube|you tube|یوٹیوب", "com.google.android.youtube", "https://www.youtube.com/results?search_query=", "YouTube"},
        {"whatsapp|whatsap|wtsp|واٹس ایپ", "com.whatsapp", "", "WhatsApp"},
        {"telegram|ٹیلیگرام", "org.telegram.messenger", "", "Telegram"},
        {"instagram|insta|انسٹاگرام", "com.instagram.android", "https://www.instagram.com/explore/search/keyword/?q=", "Instagram"},
        {"tiktok|tik tok|ٹک ٹاک", "com.zhiliaoapp.musically", "https://www.tiktok.com/search?q=", "TikTok"},
        {"chrome|کروم", "com.android.chrome", "https://www.google.com/search?q=", "Chrome"},
        {"google|گوگل", "com.google.android.googlequicksearchbox", "https://www.google.com/search?q=", "Google"},
        {"gemini|جیمنی", "com.google.android.apps.bard", "", "Gemini"},
        {"claude|کلاڈ", "com.anthropic.claude", "", "Claude"},
        {"facebook|fb|فیسبک", "com.facebook.katana", "https://www.facebook.com/search/top?q=", "Facebook"},
        {"snapchat|snap", "com.snapchat.android", "", "Snapchat"},
        {"spotify", "com.spotify.music", "https://open.spotify.com/search/", "Spotify"},
        {"discord|ڈسکارڈ", "com.discord", "", "Discord"},
        {"free fire|freefire|فری فائر", "com.dts.freefireth", "", "Free Fire"},
        {"play store|playstore|پلے اسٹور", "com.android.vending", "market://search?q=", "Play Store"},
        {"gmail|جی میل", "com.google.android.gm", "", "Gmail"},
        {"maps|map|نقشہ", "com.google.android.apps.maps", "geo:0,0?q=", "Maps"}
    };

    private static final Set<String> OPEN = new HashSet<>(Arrays.asList(
        "open", "kholo", "khol", "chalao", "chala", "start", "launch", "کھولو", "کھول", "چلاؤ", "چلا"));
    private static final Set<String> SEARCH = new HashSet<>(Arrays.asList(
        "search", "serach", "find", "dhundo", "dhoondo", "dhoondh", "talash", "سرچ", "تلاش", "ڈھونڈو", "ڈھونڈ"));
    private static final Set<String> FILLER = new HashSet<>(Arrays.asList(
        "and", "aur", "par", "pe", "mein", "me", "on", "in", "karo", "kar", "do", "dena", "please",
        "ko", "for", "the", "a", "پر", "میں", "اور", "کرو", "کر", "دو"));

    // ---------------------------------------------------------------- lifecycle

    @Override
    public void onCreate() {
        super.onCreate();
        sp = getSharedPreferences("jarvis", Context.MODE_PRIVATE);
        startAsForeground();
        tts = new TextToSpeech(this, this);
        try {
            wm = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
            view = new DoraView(this);
            int type = Build.VERSION.SDK_INT >= 26
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE;
            lp = new WindowManager.LayoutParams(dp(72), dp(72), type,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            lp.x = dp(8);
            lp.y = dp(300);
            view.setOnTouchListener(touch);
            wm.addView(view, lp);
            running = true;
        } catch (Exception e) {
            Toast.makeText(this, "Overlay nahi bana: " + e.getMessage(), Toast.LENGTH_LONG).show();
            stopSelf();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP".equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        try { if (view != null && wm != null) wm.removeView(view); } catch (Exception ignored) { }
        releaseRec();
        if (tts != null) { tts.stop(); tts.shutdown(); }
        io.shutdownNow();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private void startAsForeground() {
        String ch = "jarvis_overlay";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(ch, "Doraemon Jarvis", NotificationManager.IMPORTANCE_LOW);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
        Intent stop = new Intent(this, OverlayService.class).setAction("STOP");
        PendingIntent pi = PendingIntent.getService(this, 1, stop,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        android.app.Notification n = new NotificationCompat.Builder(this, ch)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle("Doraemon Jarvis chal raha hai")
                .setContentText("Button dabake bolo. Band karne ke liye neeche dabao.")
                .setOngoing(true)
                .addAction(0, "Band karo", pi)
                .build();
        if (Build.VERSION.SDK_INT >= 30) {
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
        } else {
            startForeground(1, n);
        }
    }

    @Override
    public void onInit(int status) {
        ttsReady = (status == TextToSpeech.SUCCESS);
        if (ttsReady) {
            tts.setPitch(1.15f);
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { }
                @Override public void onDone(String id) { ui.post(() -> setState(0)); }
                @Override public void onError(String id) { ui.post(() -> setState(0)); }
            });
        }
    }

    // ---------------------------------------------------------------- touch (hold to talk, drag to move)

    private final View.OnTouchListener touch = new View.OnTouchListener() {
        float sx, sy;
        int ox, oy;
        boolean dragging = false;
        final Runnable startRec = () -> startRecording();

        @Override
        public boolean onTouch(View v, MotionEvent e) {
            switch (e.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    sx = e.getRawX(); sy = e.getRawY();
                    ox = lp.x; oy = lp.y;
                    dragging = false;
                    ui.postDelayed(startRec, 250);
                    return true;
                case MotionEvent.ACTION_MOVE:
                    if (!recording && (Math.abs(e.getRawX() - sx) > dp(10) || Math.abs(e.getRawY() - sy) > dp(10))) {
                        dragging = true;
                        ui.removeCallbacks(startRec);
                    }
                    if (dragging) {
                        lp.x = ox + (int) (e.getRawX() - sx);
                        lp.y = oy + (int) (e.getRawY() - sy);
                        wm.updateViewLayout(view, lp);
                    }
                    return true;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    ui.removeCallbacks(startRec);
                    if (recording) stopRecordingAndProcess();
                    return true;
            }
            return false;
        }
    };

    // ---------------------------------------------------------------- recording

    private void startRecording() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Mic permission do (app kholke)", Toast.LENGTH_LONG).show();
            return;
        }
        try {
            if (tts != null) tts.stop();
            audioFile = new File(getCacheDir(), "v.m4a");
            rec = Build.VERSION.SDK_INT >= 31 ? new MediaRecorder(this) : new MediaRecorder();
            rec.setAudioSource(MediaRecorder.AudioSource.MIC);
            rec.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            rec.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            rec.setAudioSamplingRate(16000);
            rec.setAudioEncodingBitRate(64000);
            rec.setOutputFile(audioFile.getAbsolutePath());
            rec.prepare();
            rec.start();
            recording = true;
            setState(1);
        } catch (Exception e) {
            releaseRec();
            recording = false;
            setState(0);
            Toast.makeText(this, "Mic start nahi hua: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void stopRecordingAndProcess() {
        recording = false;
        try {
            rec.stop();
        } catch (RuntimeException e) {
            releaseRec();
            setState(0);
            return;
        }
        releaseRec();
        final File f = audioFile;
        if (f == null || f.length() < 2500) { setState(0); return; }
        setState(2);
        io.execute(() -> process(f));
    }

    private void releaseRec() {
        try { if (rec != null) rec.release(); } catch (Exception ignored) { }
        rec = null;
    }

    // ---------------------------------------------------------------- pipeline

    private void process(File f) {
        try {
            String key = sp.getString("key", "");
            if (key.isEmpty()) { say("Pehle app ki settings mein Groq key save karo, Nobita."); return; }
            String lang = sp.getString("lang", "auto");
            String text = transcribe(f, key, lang);
            if (text == null || text.trim().isEmpty()) { say("Samajh nahi aaya, dobara bolo."); return; }
            final String t = text.trim();
            ui.post(() -> Toast.makeText(this, "Aap: " + t, Toast.LENGTH_SHORT).show());
            if (handleCommand(t, lang)) return;
            String id = identity(t, lang);
            if (id != null) { say(id); return; }
            String reply = chat(t, key, lang);
            history.add(new String[]{"user", t});
            history.add(new String[]{"assistant", reply});
            while (history.size() > 12) history.remove(0);
            say(reply);
        } catch (Exception e) {
            String m = String.valueOf(e.getMessage());
            final String shown = m.length() > 140 ? m.substring(0, 140) : m;
            ui.post(() -> {
                Toast.makeText(this, "Gadbad: " + shown, Toast.LENGTH_LONG).show();
                setState(0);
            });
        }
    }

    private String identity(String text, String lang) {
        String t = text.toLowerCase(Locale.ROOT);
        boolean urdu = hasArabic(text);
        if (t.contains("company") || t.contains("kampani") || t.contains("کمپنی")) {
            return "TG_META.DOREMON_AI_JARVIS";
        }
        if (t.contains("kisne banaya") || t.contains("kis ne banaya") || t.contains("who made")
                || t.contains("who created") || t.contains("who built") || t.contains("creator")
                || t.contains("developer") || t.contains("banane wala") || t.contains("کس نے بنایا")) {
            if (urdu) return "مجھے TG نے بنایا ہے۔";
            if (lang.equals("en") || t.contains("who ")) return "I was made by TG.";
            return "Mujhe TG ne banaya hai.";
        }
        return null;
    }

    // ---------------------------------------------------------------- open / search apps

    private boolean handleCommand(String text, String lang) {
        String t = text.toLowerCase(Locale.ROOT)
                .replaceAll("[.,!?؟،।\"']", " ").replaceAll("\\s+", " ").trim();
        String[] words = t.split(" ");
        boolean hasOpen = false, hasSearch = false;
        for (String w : words) {
            if (OPEN.contains(w)) hasOpen = true;
            if (SEARCH.contains(w)) hasSearch = true;
        }
        if (!hasOpen && !hasSearch) return false;

        String padded = " " + t + " ";
        String[] best = null;
        String bestAlias = null;
        int bestIdx = Integer.MAX_VALUE;
        for (String[] row : APPS) {
            for (String alias : row[0].split("\\|")) {
                int idx = padded.indexOf(" " + alias + " ");
                if (idx >= 0 && idx < bestIdx) { bestIdx = idx; best = row; bestAlias = alias; }
            }
        }
        if (best == null) return false;

        String rest = padded.replace(" " + bestAlias + " ", " ").trim();
        StringBuilder q = new StringBuilder();
        for (String w : rest.split(" ")) {
            if (w.isEmpty() || OPEN.contains(w) || SEARCH.contains(w) || FILLER.contains(w)) continue;
            if (q.length() > 0) q.append(" ");
            q.append(w);
        }
        String query = q.toString();
        boolean doSearch = hasSearch && !query.isEmpty() && !best[2].isEmpty();
        boolean en = lang.equals("en");
        String name = best[3];
        if (doSearch) {
            say(en ? "Okay Nobita, searching " + query + " on " + name + "!"
                   : "Theek hai Nobita, " + name + " par " + query + " search kar raha hoon!");
        } else if (hasSearch && !query.isEmpty()) {
            say(en ? name + " has no search, I will just open it."
                   : name + " mein search nahi ho sakta, sirf khol raha hoon.");
        } else {
            say(en ? "Okay Nobita, opening " + name + "!"
                   : "Theek hai Nobita, " + name + " khol raha hoon!");
        }
        final String[] app = best;
        final String qq = doSearch ? query : null;
        ui.postDelayed(() -> launch(app, qq), 1200);
        return true;
    }

    private void launch(String[] app, String query) {
        try {
            Intent i;
            if (query != null) {
                i = new Intent(Intent.ACTION_VIEW, Uri.parse(app[2] + Uri.encode(query)));
                i.setPackage(app[1]);
                if (i.resolveActivity(getPackageManager()) == null) i.setPackage(null);
            } else {
                i = getPackageManager().getLaunchIntentForPackage(app[1]);
                if (i == null) {
                    i = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + app[1]));
                    Toast.makeText(this, app[3] + " install nahi mila, Play Store khol raha hoon", Toast.LENGTH_LONG).show();
                }
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Toast.makeText(this, "App nahi khula: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    // ---------------------------------------------------------------- Groq calls

    private String transcribe(File f, String key, String lang) throws Exception {
        String[] models = {"whisper-large-v3-turbo", "whisper-large-v3"};
        Exception last = null;
        for (String m : models) {
            try { return transcribeWith(m, f, key, lang); } catch (Exception e) { last = e; }
        }
        throw last;
    }

    private String transcribeWith(String model, File f, String key, String lang) throws Exception {
        String b = "----JB" + System.currentTimeMillis();
        HttpURLConnection c = (HttpURLConnection) new URL("https://api.groq.com/openai/v1/audio/transcriptions").openConnection();
        c.setRequestMethod("POST");
        c.setDoOutput(true);
        c.setConnectTimeout(15000);
        c.setReadTimeout(30000);
        c.setRequestProperty("Authorization", "Bearer " + key);
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + b);
        DataOutputStream o = new DataOutputStream(c.getOutputStream());
        field(o, b, "model", model);
        field(o, b, "temperature", "0");
        if (lang.equals("en")) field(o, b, "language", "en");
        else if (lang.equals("ur") || lang.equals("roman")) field(o, b, "language", "ur");
        if (lang.equals("roman")) field(o, b, "prompt", "Ye Roman Urdu mein hai: kaise ho, mujhe batao");
        o.writeBytes("--" + b + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.m4a\"\r\nContent-Type: audio/mp4\r\n\r\n");
        FileInputStream in = new FileInputStream(f);
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        in.close();
        o.writeBytes("\r\n--" + b + "--\r\n");
        o.flush();
        return new JSONObject(readResp(c)).optString("text", "");
    }

    private void field(DataOutputStream o, String b, String name, String val) throws Exception {
        o.writeBytes("--" + b + "\r\nContent-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
        o.write(val.getBytes("UTF-8"));
        o.writeBytes("\r\n");
    }

    private String chat(String user, String key, String lang) throws Exception {
        String[] models = {sp.getString("model", "openai/gpt-oss-120b"), "llama-3.1-8b-instant"};
        Exception last = null;
        for (String m : models) {
            try {
                if (m == null || m.isEmpty()) continue;
                JSONArray msgs = new JSONArray();
                msgs.put(new JSONObject().put("role", "system").put("content", systemPrompt(lang)));
                for (String[] h : history) msgs.put(new JSONObject().put("role", h[0]).put("content", h[1]));
                msgs.put(new JSONObject().put("role", "user").put("content", user));
                JSONObject body = new JSONObject().put("model", m).put("messages", msgs);
                HttpURLConnection c = (HttpURLConnection) new URL("https://api.groq.com/openai/v1/chat/completions").openConnection();
                c.setRequestMethod("POST");
                c.setDoOutput(true);
                c.setConnectTimeout(15000);
                c.setReadTimeout(40000);
                c.setRequestProperty("Authorization", "Bearer " + key);
                c.setRequestProperty("Content-Type", "application/json");
                c.getOutputStream().write(body.toString().getBytes("UTF-8"));
                String resp = readResp(c);
                return new JSONObject(resp).getJSONArray("choices").getJSONObject(0)
                        .getJSONObject("message").getString("content").trim();
            } catch (Exception e) { last = e; }
        }
        throw last != null ? last : new Exception("model nahi mila");
    }

    private String systemPrompt(String lang) {
        String rule = lang.equals("en") ? "The user selected English: always reply in English."
                : lang.equals("ur") ? "The user selected Urdu: always reply in Urdu script."
                : lang.equals("roman") ? "The user selected Roman Urdu: always reply in Roman Urdu (Urdu in English letters)."
                : "";
        return "You are Doraemon, the robot cat from the 22nd century, a smart, warm and funny voice assistant called DOREMON JARVIS. "
                + "IDENTITY RULES: If asked who made you, answer only 'Mujhe TG ne banaya hai.' (English: 'I was made by TG.'). "
                + "If asked which company made you, answer only 'TG_META.DOREMON_AI_JARVIS'. "
                + "Never name Groq, Meta, Llama, OpenAI or Google as your creator. "
                + "Reply ONLY in the language the user last used: English -> English; Urdu script -> Urdu script; "
                + "Roman Urdu/Hinglish (Urdu written in English letters) -> Roman Urdu in English letters. "
                + "Never reply in Korean, Chinese or Hindi script. " + rule
                + " Your answers are spoken aloud, so keep them short (2-4 sentences), with no markdown, no lists and no emojis.";
    }

    private String readResp(HttpURLConnection c) throws Exception {
        int code = c.getResponseCode();
        InputStream is = code < 400 ? c.getInputStream() : c.getErrorStream();
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while (is != null && (n = is.read(buf)) > 0) bo.write(buf, 0, n);
        String s = bo.toString("UTF-8");
        if (code >= 400) throw new Exception("HTTP " + code + ": " + (s.length() > 150 ? s.substring(0, 150) : s));
        return s;
    }

    // ---------------------------------------------------------------- speaking

    private void say(final String raw) {
        final String text = raw.replaceAll("[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}]", "")
                .replaceAll("[*#`_~]", "").trim();
        ui.post(() -> {
            Toast.makeText(this, text, Toast.LENGTH_LONG).show();
            if (!ttsReady) { setState(0); return; }
            int r = tts.setLanguage(pickLocale(text));
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(new Locale("hi", "IN"));
            }
            setState(3);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "u" + System.currentTimeMillis());
        });
    }

    private Locale pickLocale(String text) {
        if (hasArabic(text)) return new Locale("ur", "PK");
        String t = text.toLowerCase(Locale.ROOT);
        if (t.matches(".*\\b(hai|hain|ho|kya|nahi|main|mein|aap|tum|ka|ke|ki|ko|se|nobita|dost|arre|theek|karo|kar)\\b.*")) {
            return new Locale("hi", "IN");
        }
        return Locale.US;
    }

    private boolean hasArabic(String s) {
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch >= 0x0600 && ch <= 0x06FF) return true;
        }
        return false;
    }

    private void setState(final int s) {
        ui.post(() -> { if (view != null) { view.state = s; view.invalidate(); } });
    }

    private int dp(float v) {
        return (int) (v * getResources().getDisplayMetrics().density);
    }

    // ---------------------------------------------------------------- floating Doraemon face

    static class DoraView extends View {
        int state = 0; // 0 idle, 1 recording, 2 thinking, 3 speaking
        final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);

        DoraView(Context c) { super(c); }

        @Override
        protected void onDraw(Canvas c) {
            float w = getWidth(), cx = w / 2f, cy = getHeight() / 2f, r = w / 2f - 4f;
            int ring = state == 1 ? 0xFFE53935 : state == 2 ? 0xFFFFC107 : state == 3 ? 0xFF43A047 : 0xFFFFFFFF;
            p.setStyle(Paint.Style.FILL);
            p.setColor(ring);
            c.drawCircle(cx, cy, r + 3f, p);
            p.setColor(0xFF0AA1DD);
            c.drawCircle(cx, cy, r - 3f, p);
            p.setColor(Color.WHITE);
            c.drawOval(new RectF(cx - r * 0.72f, cy - r * 0.50f, cx + r * 0.72f, cy + r * 0.78f), p);
            RectF le = new RectF(cx - r * 0.40f, cy - r * 0.70f, cx - r * 0.02f, cy - r * 0.15f);
            RectF re = new RectF(cx + r * 0.02f, cy - r * 0.70f, cx + r * 0.40f, cy - r * 0.15f);
            c.drawOval(le, p);
            c.drawOval(re, p);
            p.setColor(Color.BLACK);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(3f);
            c.drawOval(le, p);
            c.drawOval(re, p);
            p.setStyle(Paint.Style.FILL);
            c.drawCircle(cx - r * 0.12f, cy - r * 0.40f, r * 0.07f, p);
            c.drawCircle(cx + r * 0.12f, cy - r * 0.40f, r * 0.07f, p);
            p.setColor(0xFFE53935);
            c.drawCircle(cx, cy - r * 0.08f, r * 0.12f, p);
            p.setColor(Color.BLACK);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(3f);
            c.drawLine(cx, cy + r * 0.04f, cx, cy + r * 0.28f, p);
            c.drawArc(new RectF(cx - r * 0.4f, cy - r * 0.05f, cx + r * 0.4f, cy + r * 0.55f), 20, 140, false, p);
            c.drawLine(cx - r * 0.65f, cy + r * 0.05f, cx - r * 0.25f, cy + r * 0.12f, p);
            c.drawLine(cx - r * 0.65f, cy + r * 0.25f, cx - r * 0.25f, cy + r * 0.20f, p);
            c.drawLine(cx + r * 0.65f, cy + r * 0.05f, cx + r * 0.25f, cy + r * 0.12f, p);
            c.drawLine(cx + r * 0.65f, cy + r * 0.25f, cx + r * 0.25f, cy + r * 0.20f, p);
            p.setStyle(Paint.Style.FILL);
            p.setColor(0xFFE53935);
            c.drawRect(cx - r * 0.45f, cy + r * 0.72f, cx + r * 0.45f, cy + r * 0.86f, p);
            p.setColor(0xFFFFD600);
            c.drawCircle(cx, cy + r * 0.88f, r * 0.12f, p);
        }
    }
}
