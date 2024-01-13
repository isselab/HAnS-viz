import com.github.johmara.hansviz.browser.BrowserViewerService;
import com.github.johmara.hansviz.browser.BrowserViewerWindow;
import com.intellij.openapi.project.ProjectManager;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowManager;
import com.intellij.openapi.wm.ex.ToolWindowManagerListener;
import org.jetbrains.annotations.NotNull;

public class HAnSToolWindowListener implements ToolWindowManagerListener {
    @Override
    public void stateChanged(@NotNull ToolWindowManager toolWindowManager) {
        // Hier können Sie auf Zustandsänderungen des Tool Windows reagieren
        BrowserViewerWindow browserViewerWindow = ProjectManager.getInstance().getOpenProjects()[0].getService(BrowserViewerService.class).browserViewerWindow;
        if(browserViewerWindow!=null){
            ToolWindow toolWindow = toolWindowManager.getToolWindow(browserViewerWindow.getToolWindowId());

            if (toolWindow != null) {
                if (toolWindow.isVisible()) {
                    if(!browserViewerWindow.isToolWindowOpen()){
                        System.out.println("Tool Window wurde geöffnet!");
                        browserViewerWindow.setToolWindowOpen(true);
                        if(browserViewerWindow.isViewInit() && browserViewerWindow.isBrowserReady() && browserViewerWindow.isInitPlottingDone()) {
                            browserViewerWindow.runJavascript("fetchAllData(refresh);");
                        }
                        else System.out.println("keine daten gefetcht");
                    }
                } else {
                    browserViewerWindow.setToolWindowOpen(false);
                }
            }
        }
    }
}
