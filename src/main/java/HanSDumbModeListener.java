import com.github.johmara.hansviz.browser.BrowserViewerWindow;
import com.intellij.openapi.project.DumbService;

/**
 * Listener checks if Indexing is done.
 */
public class HanSDumbModeListener implements DumbService.DumbModeListener {
    @Override
    public void exitDumbMode() {
        // Indexing is done -> that function is called every time after an indexing process.
        // "First time" has to be handeled inside called functions
        BrowserViewerWindow.runJavascript("startPlotting();");
    }
}
