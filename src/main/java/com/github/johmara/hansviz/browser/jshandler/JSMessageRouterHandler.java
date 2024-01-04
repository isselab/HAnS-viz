package com.github.johmara.hansviz.browser.jshandler;

import JSONHandler.JSONHandler;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.project.ProjectManager;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;



public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {

    private final Project project = ProjectManager.getInstance().getOpenProjects()[0];
    //private final FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);

    /**
     * Request on javascript side (that are called with window.java or window.javacancel are handeled here
     * @param browser CefBrowser
     * @param frame CefFrame
     * @param queryId long
     * @param request String: This request will be handeled
     * @param persistent boolean
     * @param callback CefQueryCallback: function that is called after success
     * @return boolean
     */
    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        System.out.println("Request: " + request); // For testing purposes
        switch (request) {
            // Add all queries that need to be handled
            case "buttonClicked" -> {
                System.out.println("Button Clicked!");
                return true;
            }
            case "refresh" -> {
                System.out.println("Refreshing!");
                // return JSON through parameter of success function
                callback.success("JSON");
                return true;
            }
            case "tangling" -> {

                // creates new JSONHandler for Tangling Graph
                new JSONHandler(project, JSONHandler.JSONType.Tangling, callback);
                return true;
            }
        }
        return false;
    }
}
