package com.github.johmara.hansviz.browser;

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
        System.out.println("factory");
        BrowserViewerWindow browserViewerWindow = project.getService(BrowserViewerService.class).browserViewerWindow;
        JComponent component = toolWindow.getComponent();
        component.getParent().add(browserViewerWindow.content(),0);

        // Browser and Window are initialized
        browserViewerWindow.setBrowserReady();

        if(!DumbService.isDumb(project)) {
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
                        browserViewerWindow.runJavascript("startPlotting();");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                });
                System.out.println("Starte Factory thread");
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
            System.out.println("Starte wait For Indexing Thread");
            delayThread.start();
        }
    }
}
