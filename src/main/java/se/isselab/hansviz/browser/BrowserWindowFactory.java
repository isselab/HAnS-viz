/*
Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson
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

package se.isselab.hansviz.browser;

import com.intellij.openapi.project.DumbService;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;

public class BrowserWindowFactory implements ToolWindowFactory {
    /* First step when window gets opened on sidebar */
    @Override
    public void createToolWindowContent(@NotNull Project project, @NotNull ToolWindow toolWindow) {
        BrowserViewerWindow browserViewerWindow = project.getService(BrowserViewerService.class).browserViewerWindow;
        JComponent component = toolWindow.getComponent();
        component.getParent().add(browserViewerWindow.content(),0);
        browserViewerWindow.setToolWindowId(toolWindow.getId());

        // Browser and Window are initialized
        browserViewerWindow.setBrowserReady();

        if(!DumbService.isDumb(project)) { // &line[DumbModeHandler]
            if(!browserViewerWindow.isViewInit()){
                browserViewerWindow.setViewInit();
                // Dieser Code wird NICHT ausgeführt.
                /*browserViewerWindow.runJavascript("startPlotting();");*/

                Thread delayThread = new Thread(() -> {
                    try {
                        // 2000 Millisekunden (2 Sekunden) warten
                        Thread.sleep(1000);
                        // Code ausführen nach 2 Sekunden
                        // Dieser Code wird ausgeführt.
                        browserViewerWindow.setInitPlottingDone();
                        browserViewerWindow.runJavascript("startPlotting();");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                });
                delayThread.start();
                // browserViewerWindow.runJavascript("alert('hallo');");
            }
        }
        else {
            Thread delayThread = new Thread(()-> {
                try {
                    Thread.sleep(1000);

                    browserViewerWindow.runJavascript("waitForIndexing();");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });
            delayThread.start();
        }
    }
}
