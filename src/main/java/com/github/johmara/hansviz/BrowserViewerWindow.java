// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.github.johmara.hansviz;

import com.github.johmara.hansviz.JSHandler.JSMessageRouterHandler;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Disposer;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiFileSystemItem;
import com.intellij.psi.search.FilenameIndex;
import com.intellij.psi.search.GlobalSearchScope;
import com.intellij.ui.jcef.JBCefBrowser;
import org.cef.CefApp;
import org.cef.CefClient;
import org.cef.browser.CefMessageRouter;

import javax.swing.*;

/**
 * A class creating the JCEF browser used as content in a ToolWindow
 */
public class BrowserViewerWindow {

    private final JBCefBrowser webView;

    private final Box content;
    private final Project project;


    /**
     * Constructs a JCEF view containing the Feature Localisation View and Tangling View
     * @param service The parent service of the view
     * @param project The project the view is for
     */
    public BrowserViewerWindow(BrowserViewerService service, Project project) {
        webView = new JBCefBrowser();
        registerAppSchemeHandler();
        initialiseJSHandler(webView.getCefBrowser().getClient());
        webView.loadURL("http://hans/index.html");

        /**
         * Helps IDE with memory management -> avoid "Memory leak detected"
         */
        Disposer.register(service, webView);


        // Setup the menubar in JCEF
        JMenuBar menuBar = new JMenuBar();

        content = new Box(BoxLayout.Y_AXIS);
        content.add(menuBar);
        content.add(webView.getComponent());
        this.project = project;
    }

    private void initialiseJSHandler(CefClient client) {
        // create routing point for JS -> window.java ({})
        CefMessageRouter.CefMessageRouterConfig cefMessageRouterConfig = new CefMessageRouter.CefMessageRouterConfig("java","javaCancel");
        CefMessageRouter cefMessageRouter = CefMessageRouter.create(cefMessageRouterConfig);
        cefMessageRouter.addHandler(new JSMessageRouterHandler(), true);
        client.addMessageRouter(cefMessageRouter);
    }

    private void registerAppSchemeHandler() {
        CefApp.getInstance().registerSchemeHandlerFactory(
                "http",
                "hans",
                new BrowserSchemeHandlerFactory()
        );
    }

    /**
     * Gets the JCEF browser
     * @return The JCEF browser as a JComponent.
     */
    public JComponent content() {
        System.out.println("return content");
        return content;
    }




    /**
     * Searches the project for a file (or folder) with the specified filename
     * and returns it as a VirtualFile.
     * (Currently does not support to find the correct file when multiple files
     * with the same name exists)
     * @param fileName The name of the file (or folder) that should be returned
     * @return A file (or folder) as a VirtualFile
     *
     */
    private VirtualFile getVirtualFile(String fileName) {
        // Try and return a file
        PsiFile[] allFilenames = FilenameIndex.getFilesByName(
                project, fileName, GlobalSearchScope.projectScope(project));
        if (allFilenames.length > 0) {
            return allFilenames[0].getVirtualFile();
        }
        // Try and return a folder
        PsiFileSystemItem[] allFoldernames = FilenameIndex.getFilesByName(
                project, fileName, GlobalSearchScope.projectScope(project), true);
        if (allFoldernames.length > 0) {
            return allFoldernames[0].getVirtualFile();
        }
        // No file/folder found
        return null;
    }
}
