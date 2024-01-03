package com.github.johmara.hansviz.browser.jshandler;

import JSONHandler.JSONHandler;
import com.intellij.codeInsight.daemon.impl.quickfix.FetchExtResourceAction;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.progress.ProgressIndicator;
import com.intellij.openapi.progress.ProgressManager;
import com.intellij.openapi.progress.Task;
import com.intellij.openapi.project.ProjectManager;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;
import org.jetbrains.annotations.NotNull;
import se.isselab.HAnS.featureModel.FeatureModelUtil;
import se.isselab.HAnS.featureExtension.FeatureService;
import se.isselab.HAnS.featureLocation.FeatureFileMapping;
import se.isselab.HAnS.featureLocation.FeatureLocationManager;

import java.util.HashMap;
import java.util.concurrent.atomic.AtomicReference;


public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {

    private FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);
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
                // service.getTanglingMap();

                // TODO THESIS: HAnS-Viz should not start any background or modal task. Change this to only
                //  JSONHandler.getFeatureJSON(JSONHandler.JSONType.Tangling, service.getAllFeatureFileMappings(), service.getTanglingMap()).toJSONString()
                //  We maybe need to implement interface extension point HAnSCallback and give it to service

                AtomicReference<String> result = new AtomicReference<>();
                ProgressManager.getInstance().run(new Task.Modal(ProjectManager.getInstance().getOpenProjects()[0], "Processing Features", false) {
                    @Override
                    public void run(@NotNull ProgressIndicator indicator) {
                        //TODO THESIS
                        // wrap in read action
                        result.set(JSONHandler.getFeatureJSON(JSONHandler.JSONType.Tangling, service.getAllFeatureFileMappings(), service.getTanglingMap()).toJSONString());
                    }
                });
                callback.success(result.get());
                return true;
            }
        }
        return false;
    }
}
