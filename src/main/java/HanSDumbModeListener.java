import com.github.johmara.hansviz.browser.BrowserViewerWindow;
import com.intellij.openapi.project.DumbService;

/**
 * Listener checks if Indexing is done.
 */
public class HanSDumbModeListener implements DumbService.DumbModeListener {
    @Override
    public void exitDumbMode() {
        BrowserViewerWindow.runJavascript("startPlotting();");
        System.out.println("exitDumbMode");
        System.out.println("Änderung");
        // DumbService.DumbModeListener.super.exitDumbMode();
    }
}
