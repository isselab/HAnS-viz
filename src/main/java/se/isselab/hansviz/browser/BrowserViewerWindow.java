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

import com.intellij.openapi.ui.Messages;
import com.intellij.ui.jcef.JBCefBrowserBase;
import se.isselab.hansviz.browser.jshandler.JSMessageRouterHandler;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Disposer;
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
    private static BrowserViewerWindow browserViewerWindow;

    private final Box content;
    private final Project project;
    private boolean viewInit = false;
    private boolean browserReady = false;
    private boolean toolWindowOpen = false;
    private boolean initPlottingDone = false;
    private String toolWindowId;
/*

    */
/**
     * Singleton, while there is only one BrowserViewerWindow for a project.
     * @return BrowserViewerWindow instance
     *//*

    public static BrowserViewerWindow getInstance() {
        return browserViewerWindow;
    }
    public static BrowserViewerWindow startInstance(BrowserViewerService service, Project project) {
        browserViewerWindow = new BrowserViewerWindow(service, project);
        return browserViewerWindow;
    }
*/

    /**
     * Constructs a JCEF view containing the Feature Localisation View and Tangling View
     * @param service The parent service of the view
     * @param project The project the view is for
     */
    public BrowserViewerWindow(BrowserViewerService service, Project project) {
        this.project = project;
        webView = new JBCefBrowser();
        webView.setProperty(JBCefBrowserBase.Properties.NO_CONTEXT_MENU, Boolean.TRUE);
        registerAppSchemeHandler();
        initialiseJSHandler(webView.getCefBrowser().getClient());
        webView.loadURL("http://hans/index.html");


        // Helps IDE with memory management -> avoid "Memory leak detected"
        Disposer.register(service, webView);


        // Setup the menubar in JCEF
        JMenuBar menuBar = new JMenuBar();

        content = new Box(BoxLayout.Y_AXIS);
        content.add(menuBar);
        content.add(webView.getComponent());
    }

    /**
     * Initialises Javascript Handler.
     * Request from Javascript-side with window.java and window.javacancel can be handeled through this handler.
     * @param client CefClient
     */
    private void initialiseJSHandler(CefClient client) {
        // create routing point for JS -> window.java ({})
        CefMessageRouter.CefMessageRouterConfig cefMessageRouterConfig = new CefMessageRouter.CefMessageRouterConfig("java","javaCancel");
        CefMessageRouter cefMessageRouter = CefMessageRouter.create(cefMessageRouterConfig);
        cefMessageRouter.addHandler(new JSMessageRouterHandler(project), true);
        client.addMessageRouter(cefMessageRouter);
    }

    /**
     * Registers App Scheme Handler that introduces {@link BrowserSchemeHandlerFactory}
     */
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
        return content;
    }

    /**
     * Returns the ID of the associated toolWindow
     * @return
     */
    public String getToolWindowId() {
        return toolWindowId;
    }

    /**
     * Sets ID of the associated toolWindow
     * @param toolWindowId
     */
    public void setToolWindowId(String toolWindowId) {
        this.toolWindowId = toolWindowId;
    }

    /**
     * Indicates if the associated toolWindow is open
     * @return
     */
    public boolean isToolWindowOpen() {
        return toolWindowOpen;
    }

    /**
     * Sets associated toolWindow indicator to open
     * @param open
     */
    public void setToolWindowOpen(boolean open) {
        this.toolWindowOpen = open;
    }

    /**
     * Blocks startPlotting()-process, if one is called while the other one's thread is sleeping. Works like a mutex
     * @return
     */
    public boolean isViewInit(){
        return viewInit;
    }

    /**
     * Is set before thread starts with startPlotting()
     */
    public void setViewInit(){
        viewInit = true;
    }

    /**
     * Indicates if plotting is already done
     * @return
     */
    public boolean isInitPlottingDone() {
        return initPlottingDone;
    }

    /**
     * Can only be called and set to true before startPlotting();
     */
    public void setInitPlottingDone() {
        initPlottingDone = true;
    }

    /**
     * Indicates if factory process is done
     * @return
     */
    public boolean isBrowserReady(){
        return browserReady;
    }

    /**
     * Is set after factory process is done
     */
    public void setBrowserReady(){
        browserReady = true;
    }
    /**
     * Can call a javascript function of current view. Parameter function has to be in js-format, e.g. "function();"
     * @param function String
     */
    public void runJavascript(String function) {
        webView.getCefBrowser().executeJavaScript(function, null, 0);
    }
}
