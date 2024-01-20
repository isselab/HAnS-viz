package se.isselab.hansviz.listener;

import com.intellij.openapi.project.Project;
import se.isselab.hansviz.browser.BrowserViewerService;
import se.isselab.hansviz.browser.BrowserViewerWindow;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowManager;
import com.intellij.openapi.wm.ex.ToolWindowManagerListener;
import org.jetbrains.annotations.NotNull;

public class HAnSToolWindowListener implements ToolWindowManagerListener {
    private final Project project;
    public HAnSToolWindowListener(Project project){
        this.project = project;
    }
    @Override
    public void stateChanged(@NotNull ToolWindowManager toolWindowManager) {
        BrowserViewerWindow browserViewerWindow = project.getService(BrowserViewerService.class).browserViewerWindow;
        if(browserViewerWindow!=null){
            ToolWindow toolWindow = toolWindowManager.getToolWindow(browserViewerWindow.getToolWindowId());

            if (toolWindow != null) {
                if (toolWindow.isVisible()) {
                    if(!browserViewerWindow.isToolWindowOpen()){
                        browserViewerWindow.setToolWindowOpen(true);
                        if(browserViewerWindow.isViewInit() && browserViewerWindow.isBrowserReady() && browserViewerWindow.isInitPlottingDone()) {
                            browserViewerWindow.runJavascript("fetchAllData(refresh);");
                        }
                    }
                } else {
                    browserViewerWindow.setToolWindowOpen(false);
                }
            }
        }
    }

}
