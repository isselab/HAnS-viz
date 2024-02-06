/*
Copyright 2024 David Stechow & Philipp Kusmierz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
                    delayThread.start();
                }
            }
        }
    }
}
