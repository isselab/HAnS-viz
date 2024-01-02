package com.github.johmara.hansviz.browser.jshandler;

import JSONHandler.JSONHandler;
import com.intellij.codeInsight.daemon.impl.quickfix.FetchExtResourceAction;
import com.intellij.openapi.project.ProjectManager;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;
import se.isselab.HAnS.featureExtension.FeatureService;


public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {

    private FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);
    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        System.out.println("Request: " + request); // For testing purposes
        switch(request) {
            // Add all queries that need to be handled
            case "buttonClicked":
                System.out.println("Button Clicked!");
                return true;
            case "refresh":
                System.out.println("Refreshing!");
                // return JSON through parameter of success function
                callback.success("JSON");
                return true;
            case "tanglingDegree":

                // service.getTanglingMap();
                callback.success(JSONHandler.getFeatureJSON(JSONHandler.JSONType.Tangling, service.getAllFeatureFileMappings(), service.getTanglingMap()).toJSONString());
        }
        return false;
    }
}
