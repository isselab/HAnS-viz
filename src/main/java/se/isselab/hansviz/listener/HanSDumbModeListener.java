package se.isselab.hansviz.listener;

import com.intellij.openapi.project.Project;
import se.isselab.hansviz.browser.BrowserViewerService;
import se.isselab.hansviz.browser.BrowserViewerWindow;
import com.intellij.openapi.project.DumbService;
import com.intellij.openapi.project.ProjectManager;

/**
 * Listener checks if Indexing is done.
 */
public class HanSDumbModeListener implements DumbService.DumbModeListener {
    @Override
    public void exitDumbMode() {
        // Indexing is done -> that function is called every time after an indexing process.
        // "First time" has to be handeled inside called functions

        //BrowserViewerWindow browserViewerWindow = ProjectManager.getInstance().getOpenProjects()[0].getService(BrowserViewerService.class).browserViewerWindow;
        for(Project project:ProjectManager.getInstance().getOpenProjects()){
            BrowserViewerWindow browserViewerWindow = project.getService(BrowserViewerService.class).browserViewerWindow;
            if(browserViewerWindow!=null) {
                System.out.println("browserViewWindow ViewInit: "+ browserViewerWindow.isViewInit());
                if((!browserViewerWindow.isViewInit()) && browserViewerWindow.isBrowserReady()){
                    browserViewerWindow.setViewInit();
                    Thread delayThread = new Thread(() -> {
                        try {
                            Thread.sleep(1000);
                            browserViewerWindow.setInitPlottingDone();
                            browserViewerWindow.runJavascript("startPlotting();");
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    });
                    System.out.println("Starte Dumb Thread");
                    delayThread.start();
                }
            }
        }
    }
}
