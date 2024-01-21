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
