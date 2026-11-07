package com.tgmeta.doremonjarvis;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.graphics.Bitmap;
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
