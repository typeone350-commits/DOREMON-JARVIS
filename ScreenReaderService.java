package com.tgmeta.doremonjarvis;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.util.DisplayMetrics;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.graphics.Rect;
import android.view.accessibility.AccessibilityWindowInfo;
import android.os.Build;
import android.view.Display;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

// Reads the visible text of the app/web page under the floating Doraemon.
// It only reads when the user asks (press the button and say "yahan kya likha hai").
public class ScreenReaderService extends AccessibilityService {

    public static ScreenReaderService instance;

    @Override
    protected void onServiceConnected() {
        instance = this;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) { }

    @Override
    public void onInterrupt() { }

    @Override
    public boolean onUnbind(Intent intent) {
        instance = null;
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        instance = null;
        super.onDestroy();
    }

    // returns null if the service is not enabled, "" if the screen has no readable text
    public static String readScreen() {
        ScreenReaderService s = instance;
        if (s == null) return null;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return "";
        StringBuilder sb = new StringBuilder();
        collect(root, sb, 0);
        return sb.toString().trim();
    }

    // Reads the real text of every app that is inside the given screen rectangle (null = whole screen).
    // Works for WhatsApp, Notes, Chrome, app names, etc. Returns null if the service is off.
    public static String readRegionText(Rect region) {
        ScreenReaderService s = instance;
        if (s == null) return null;
        StringBuilder sb = new StringBuilder();
        java.util.List<AccessibilityWindowInfo> wins = s.getWindows();
        if (wins != null && !wins.isEmpty()) {
            for (AccessibilityWindowInfo w : wins) {
                if (w.getType() != AccessibilityWindowInfo.TYPE_APPLICATION) continue; // skip keyboard / system bars
                AccessibilityNodeInfo root = w.getRoot();
                if (root != null) collectIn(root, region, sb, 0);
            }
        } else {
            AccessibilityNodeInfo root = s.getRootInActiveWindow();
            if (root != null) collectIn(root, region, sb, 0);
        }
        return sb.toString().trim();
    }

    private static void collectIn(AccessibilityNodeInfo n, Rect region, StringBuilder sb, int depth) {
        if (n == null || sb.length() > 6000 || depth > 60) return;
        if (!n.isVisibleToUser()) return;
        if (region != null) {
            Rect b = new Rect();
            n.getBoundsInScreen(b);
            if (!Rect.intersects(b, region)) return;
        }
        if (!n.isPassword()) {
            CharSequence t = n.getText();
            CharSequence d = n.getContentDescription();
            if (t != null && t.length() > 0) sb.append(t).append("\n");
            else if (d != null && d.length() > 0) sb.append(d).append("\n");
        }
        for (int i = 0; i < n.getChildCount(); i++) {
            collectIn(n.getChild(i), region, sb, depth + 1);
        }
    }

    // ------------------------------------------------------------ smart UI navigation

    // back / home / recents / notifications
    public static boolean globalAction(int action) {
        ScreenReaderService s = instance;
        return s != null && s.performGlobalAction(action);
    }

    // scroll the biggest scrollable area on screen (forward = down)
    public static boolean scroll(boolean forward) {
        ScreenReaderService s = instance;
        if (s == null) return false;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return false;
        java.util.List<AccessibilityNodeInfo> list = new java.util.ArrayList<>();
        collectScrollable(root, list, 0);
        AccessibilityNodeInfo best = null;
        long bestArea = -1;
        for (AccessibilityNodeInfo n : list) {
            Rect b = new Rect();
            n.getBoundsInScreen(b);
            long area = (long) b.width() * b.height();
            if (area > bestArea) { bestArea = area; best = n; }
        }
        if (best == null) return false;
        return best.performAction(forward ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
                : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
    }

    private static void collectScrollable(AccessibilityNodeInfo n, java.util.List<AccessibilityNodeInfo> out, int depth) {
        if (n == null || depth > 60 || !n.isVisibleToUser()) return;
        if (n.isScrollable()) out.add(n);
        for (int i = 0; i < n.getChildCount(); i++) collectScrollable(n.getChild(i), out, depth + 1);
    }

    // finds a visible clickable thing whose text or description matches the query
    private static AccessibilityNodeInfo locate(String query) {
        ScreenReaderService s = instance;
        if (s == null) return null;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return null;
        java.util.List<AccessibilityNodeInfo> found = root.findAccessibilityNodeInfosByText(query);
        if (found == null) return null;
        AccessibilityNodeInfo best = null;
        int bestScore = -1;
        for (AccessibilityNodeInfo n : found) {
            if (!n.isVisibleToUser() || n.isPassword()) continue;
            AccessibilityNodeInfo c = n;
            int up = 0;
            while (c != null && !c.isClickable() && up < 6) { c = c.getParent(); up++; }
            if (c == null || !c.isClickable() || !c.isVisibleToUser()) continue;
            CharSequence t = n.getText() != null ? n.getText() : n.getContentDescription();
            int score = (t != null && t.toString().trim().equalsIgnoreCase(query.trim())) ? 2 : 1;
            if (score > bestScore) { bestScore = score; best = c; }
        }
        return best;
    }

    private static String labelOf(AccessibilityNodeInfo n) {
        if (n == null) return "";
        CharSequence t = n.getText();
        if (t != null && t.length() > 0) return t.toString();
        CharSequence d = n.getContentDescription();
        if (d != null && d.length() > 0) return d.toString();
        for (int i = 0; i < n.getChildCount(); i++) {
            String r = labelOf(n.getChild(i));
            if (!r.isEmpty()) return r;
        }
        return "";
    }

    // returns {label, packageName} of the thing that would be tapped, or null
    public static String[] findTapTarget(String query) {
        AccessibilityNodeInfo c = locate(query);
        if (c == null) return null;
        String label = labelOf(c);
        if (label.isEmpty()) label = query;
        CharSequence pkg = c.getPackageName();
        return new String[]{label, pkg == null ? "" : pkg.toString()};
    }

    public static boolean performTap(String query) {
        AccessibilityNodeInfo c = locate(query);
        return c != null && c.performAction(AccessibilityNodeInfo.ACTION_CLICK);
    }

    // A real finger swipe in the middle of the screen. up = true moves the finger upward (next reel / scroll down).
    public static boolean swipe(boolean up) {
        ScreenReaderService s = instance;
        if (s == null) return false;
        DisplayMetrics dm = s.getResources().getDisplayMetrics();
        float w = dm.widthPixels, h = dm.heightPixels;
        Path p = new Path();
        if (up) {
            p.moveTo(w * 0.5f, h * 0.78f);
            p.lineTo(w * 0.5f, h * 0.25f);
        } else {
            p.moveTo(w * 0.5f, h * 0.25f);
            p.lineTo(w * 0.5f, h * 0.78f);
        }
        GestureDescription g = new GestureDescription.Builder()
                .addStroke(new GestureDescription.StrokeDescription(p, 0, 260))
                .build();
        return s.dispatchGesture(g, null, null);
    }

    private static AccessibilityNodeInfo firstCheckable(AccessibilityNodeInfo n, int depth) {
        if (n == null || depth > 8) return null;
        if (n.isCheckable()) return n;
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo r = firstCheckable(n.getChild(i), depth + 1);
            if (r != null) return r;
        }
        return null;
    }

    private static int countCheckable(AccessibilityNodeInfo n, int depth) {
        if (n == null || depth > 8) return 0;
        int c = n.isCheckable() ? 1 : 0;
        for (int i = 0; i < n.getChildCount(); i++) c += countCheckable(n.getChild(i), depth + 1);
        return c;
    }

    // Finds the switch that belongs to the row named `label` (e.g. "Wi-Fi", "Mobile data") and sets it.
    // 1 = changed, 2 = already in that state, 0 = could not find a safe switch, -1 = service off
    public static int setToggle(String label, boolean wantOn) {
        ScreenReaderService s = instance;
        if (s == null) return -1;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return 0;
        java.util.List<AccessibilityNodeInfo> found = root.findAccessibilityNodeInfosByText(label);
        if (found == null) return 0;
        for (AccessibilityNodeInfo n : found) {
            AccessibilityNodeInfo a = n;
            for (int up = 0; up < 4 && a != null; up++) {
                // only trust a row that contains exactly ONE switch, so we never flip the wrong one
                if (countCheckable(a, 0) == 1) {
                    AccessibilityNodeInfo sw = firstCheckable(a, 0);
                    if (sw != null) {
                        if (sw.isChecked() == wantOn) return 2;
                        AccessibilityNodeInfo c = sw;
                        int u = 0;
                        while (c != null && !c.isClickable() && u < 4) { c = c.getParent(); u++; }
                        if (c != null && c.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return 1;
                        return 0;
                    }
                }
                a = a.getParent();
            }
        }
        return 0;
    }

    // package name of the app that is on screen now
    public static String activePackage() {
        ScreenReaderService s = instance;
        if (s == null) return null;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return null;
        CharSequence p = root.getPackageName();
        return p == null ? null : p.toString();
    }

    // clicks a button whose text is exactly `text`. 1 = clicked, 2 = found but disabled, 0 = not found, -1 = service off
    public static int clickText(String text) {
        ScreenReaderService s = instance;
        if (s == null) return -1;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return 0;
        java.util.List<AccessibilityNodeInfo> list = root.findAccessibilityNodeInfosByText(text);
        if (list == null) return 0;
        for (AccessibilityNodeInfo n : list) {
            if (!n.isVisibleToUser()) continue;
            CharSequence t = n.getText();
            if (t == null || !t.toString().trim().equalsIgnoreCase(text)) continue;
            AccessibilityNodeInfo c = n;
            int up = 0;
            while (c != null && !c.isClickable() && up < 6) { c = c.getParent(); up++; }
            if (c == null) continue;
            if (!c.isEnabled()) return 2;
            return c.performAction(AccessibilityNodeInfo.ACTION_CLICK) ? 1 : 0;
        }
        return 0;
    }

    private static void collectEditable(AccessibilityNodeInfo n, java.util.List<AccessibilityNodeInfo> out, int depth) {
        if (n == null || depth > 60 || !n.isVisibleToUser()) return;
        if (n.isEditable()) out.add(n);
        for (int i = 0; i < n.getChildCount(); i++) collectEditable(n.getChild(i), out, depth + 1);
    }

    // types text into the field that has the cursor (any app). 1 = done, 0 = no field, 2 = password field, -1 = service off
    public static int typeText(String text) {
        ScreenReaderService s = instance;
        if (s == null) return -1;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return 0;
        AccessibilityNodeInfo f = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (f == null) {
            java.util.List<AccessibilityNodeInfo> fields = new java.util.ArrayList<>();
            collectEditable(root, fields, 0);
            if (fields.size() == 1) f = fields.get(0); // only one box on screen: use it
        }
        if (f == null) return 0;
        if (f.isPassword()) return 2;
        CharSequence cur = f.getText();
        String base = (cur == null || (Build.VERSION.SDK_INT >= 26 && f.isShowingHintText())) ? "" : cur.toString();
        String merged = base.isEmpty() ? text : base + (base.endsWith(" ") ? "" : " ") + text;
        Bundle b = new Bundle();
        b.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, merged);
        return f.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, b) ? 1 : 0;
    }

    // presses the keyboard's Enter / Search key in the focused field (Android 11+)
    public static boolean imeEnter() {
        ScreenReaderService s = instance;
        if (s == null || Build.VERSION.SDK_INT < 30) return false;
        AccessibilityNodeInfo root = s.getRootInActiveWindow();
        if (root == null) return false;
        AccessibilityNodeInfo f = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (f == null) return false;
        return f.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_IME_ENTER.getId());
    }

    // Takes a screenshot of the whole screen (Android 11+). Call from a background thread.
    // Secure screens (banking apps etc.) are blocked by Android itself and will fail.
    public static Bitmap captureBlocking() throws Exception {
        final ScreenReaderService s = instance;
        if (s == null) throw new Exception("accessibility_off");
        if (Build.VERSION.SDK_INT < 30) throw new Exception("android_too_old");
        final Bitmap[] out = new Bitmap[1];
        final String[] err = new String[1];
        final CountDownLatch latch = new CountDownLatch(1);
        s.takeScreenshot(Display.DEFAULT_DISPLAY, s.getMainExecutor(),
                new AccessibilityService.TakeScreenshotCallback() {
                    @Override
                    public void onSuccess(AccessibilityService.ScreenshotResult r) {
                        try {
                            Bitmap hw = Bitmap.wrapHardwareBuffer(r.getHardwareBuffer(), r.getColorSpace());
                            out[0] = hw.copy(Bitmap.Config.ARGB_8888, false);
                            r.getHardwareBuffer().close();
                        } catch (Exception e) {
                            err[0] = String.valueOf(e.getMessage());
                        }
                        latch.countDown();
                    }

                    @Override
                    public void onFailure(int errorCode) {
                        err[0] = "screenshot_failed_" + errorCode;
                        latch.countDown();
                    }
                });
        if (!latch.await(6, TimeUnit.SECONDS)) throw new Exception("screenshot_timeout");
        if (out[0] == null) throw new Exception(err[0] == null ? "screenshot_failed" : err[0]);
        return out[0];
    }

    private static void collect(AccessibilityNodeInfo n, StringBuilder sb, int depth) {
        if (n == null || sb.length() > 6000 || depth > 60) return;
        if (!n.isVisibleToUser()) return;
        if (!n.isPassword()) {
            CharSequence t = n.getText();
            CharSequence d = n.getContentDescription();
            if (t != null && t.length() > 0) sb.append(t).append("\n");
            else if (d != null && d.length() > 0) sb.append(d).append("\n");
        }
        for (int i = 0; i < n.getChildCount(); i++) {
            collect(n.getChild(i), sb, depth + 1);
        }
    }
}
